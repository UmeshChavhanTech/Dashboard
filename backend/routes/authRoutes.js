import bcrypt from 'bcryptjs';
import dotnev from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authorizeRoles, verifyToken } from '../middleware/authorizeRole.js';
import { SendVerificationcode } from '../middleware/Email.js';
import User from '../models/user.js';
const router = express.Router();

dotnev.config(); // Load environment variables from .env file

// Get all users (admin, backenduser, user)
router.get('/', verifyToken, authorizeRoles('admin', 'backenduser', 'user'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});



// Create new user (admin only)
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.status(201).json(newUser);
});

router.put('/:id', verifyToken, async (req, res) => {
  // Only verifyToken middleware to ensure user is logged in and token is valid
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});


// Delete a user (admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Get paginated list of users (admin only)
router.get('/allusers', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const users = await User.find({}, 'name email role').skip(skip).limit(limit);

      const totalUsers = await User.countDocuments();
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
          users,
          totalUsers,
          totalPages,
          currentPage: page,
      });
  } catch (error) {
      console.error('Pagination error:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


router.post('/register', async (req, res) => {
  console.log("o", req.url)
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  console.log('Received registration request:', req.body);
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Please fill in all fields' 
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // . Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

// . Create new user with verification code
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword,
      verificationCode,
      emailVerified: false
    });

    // Save user in DB
    await newUser.save();

     //  Send verification email with code
     SendVerificationcode(email, verificationCode);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log("token");

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token 
    });

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// @route   GET /api/auth/validate
// @desc    Validate JWT token
// @access  Public (token required)

//Validation 
router.get('/validate', (req, res) => {
  
  const authHeader = req.headers.authorization;

  console.log('Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or malformed header');
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Clean split

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    return res.status(200).json({ valid: true, userId: decoded.id });
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});


//Email Verify

router.post('/verify', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
      // 1. Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      // 2. Check if code matches (with trimming and string conversion)
      const storedCode = String(user.verificationCode).trim();
      const submittedCode = String(verificationCode).trim();

      console.log('Stored verification code:', storedCode);
      console.log('Submitted verification code:', submittedCode);

      if (storedCode !== submittedCode) {
          return res.status(400).json({
              message: 'Invalid verification code',
              debug: {
                  storedCode: user.verificationCode,
                  submittedCode: verificationCode,
              },
          });
      }

      // 3. Clear verification code and mark as verified
      user.verificationCode = null;
      user.emailVerified = true;
      await user.save();

      // 4. Generate new JWT token
      const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // 5. Send response with token
      return res.status(200).json({
          message: 'Email verified successfully',
          token,
          userId: user._id,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
  }
});

//      RESEND VERIFICATION code
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
      // 1. Find existing user
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({
              success: false,
              message: 'No user found with this email',
          });
      }

      // 2. Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = verificationCode;
      await user.save();

      // 3. Send new verification email
      SendVerificationcode(email, verificationCode);

      // 4. Send response
      res.status(200).json({
          success: true,
          message: 'New verification code sent',
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});






export default router;
