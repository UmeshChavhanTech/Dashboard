import axios from 'axios';
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dropdown from '../../src/components/Dropdown';
import IconCaretDown from '../../src/components/Icon/IconCaretDown';
import IconFacebookCircle from '../../src/components/Icon/IconFacebookCircle';
import IconGoogle from '../../src/components/Icon/IconGoogle';
import IconInstagram from '../../src/components/Icon/IconInstagram';
import IconLockDots from '../../src/components/Icon/IconLockDots';
import IconMail from '../../src/components/Icon/IconMail';
import IconTwitter from '../../src/components/Icon/IconTwitter';
import IconUser from '../../src/components/Icon/IconUser';
import { IRootState } from '../../src/store';
import { setPageTitle, toggleRTL } from '../../src/store/themeConfigSlice';

const RegisterBoxed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [enteredCode, setEnteredCode] = useState('');
    const [codeError, setCodeError] = useState('');
    // Removed duplicate declarations of isRtl and setLocale
    //const [isRtl, setIsRtl] = useState(false);
    // const [locale, setLocale] = useState('en');
    // Removed duplicate declaration of flag and setFlag
    // const [flag, setFlag] = useState('en');
    

    useEffect(() => {
        dispatch(setPageTitle('Register Boxed'));
    }, [dispatch]);

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass === 'rtl');

    const [flag, setFlag] = useState(themeConfig.locale);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '' 
    });
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: undefined,
            });
        }
    };

    const validateForm = () => {
        const newErrors: { name?: string; email?: string; password?: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (!validateForm()) return;
    
        try {
            
    
            const response = await axios.post('http://localhost:5000/api/auth/register', formData);
    
            console.log('✅ Registration response:', response.data);
    
            const token = response.data.token; // adjust this if your token is nested
    
                if (response.status === 201 && token) {
                localStorage.setItem('token', token);

                // Optional: log token for development only (remove in production)
                console.log('🔐 Token stored:', token);

                toast.success('Registration successful!', {
                    position: 'top-right',
                    autoClose: 5000,
                });
                setIsVerificationSent(true);
                setVerificationEmail(formData.email); 

                // navigate('/index');
            } 
                 else {
                    toast.error('Registration failed: Token missing');
                }
            }
             catch (err: any) {
            console.error('❌ Registration error:', err.response?.data || err.message);
    
            let errorMessage = 'Registration failed! Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
        
    };
      
    
    const verifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!enteredCode || enteredCode.length !== 6) {
            setCodeError('Please enter a valid 6-digit code');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: verificationEmail,
                    verificationCode: enteredCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                toast.success('Account verified successfully!');
                navigate('/index');
            } else {
                setCodeError(data.message || 'Invalid verification code');
            }
        } catch (error) {
            toast.error('Error verifying code. Please try again.');
        }
    };
    
    const resendVerification = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: verificationEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Verification email resent!');
            } else {
                toast.error(data.message || 'Failed to resend verification email');
            }
        } catch (error) {
            toast.error('Error resending verification email');
        }
    };
    
    // Background UI elements
    const renderBackground = () => (
        <>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/coming-soon-bg.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
            <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
            <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
            <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
        </>
    );

    // Language dropdown
    const renderLanguageDropdown = () => (
        <div className="absolute top-6 end-6">
            <div className="dropdown">
                <Dropdown
                    offset={[0, 8]}
                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                    btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                    button={
                        <>
                            <div>
                                <img src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                            </div>
                            <div className="text-base font-bold uppercase">{flag}</div>
                            <span className="shrink-0">
                                <IconCaretDown />
                            </span>
                        </>
                    }
                >
                    <ul className="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
                        {themeConfig.languageList.map((item) => (
                            <li key={item.code}>
                                <button
                                    type="button"
                                    className={`flex w-full hover:text-primary rounded-lg ${flag === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                    onClick={() => {
                                        i18next.changeLanguage(item.code);
                                        setLocale(item.code);
                                        setFlag(item.code);
                                    }}
                                >
                                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full" />
                                    <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Dropdown>
            </div>
        </div>
    );

    // Verification UI
    const renderVerificationUI = () => (
        <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Verify Your Email</h1>
                <p className="text-base font-bold leading-normal text-white-dark">Enter the verification code sent to your email</p>
            </div>
            <form className="space-y-5 dark:text-white" onSubmit={verifyCode}>
                <div className="mb-5 rounded border border-[#1abc9c] bg-[#1abc9c]/20 p-3 text-[#1abc9c]">
                    <p>Verification email sent to {verificationEmail}</p>
                    <p className="mt-1">Please check your email to verify your account before logging in.</p>
                </div>

                <div>
                    <label htmlFor="verificationCode">Verification Code</label>
                    <div className="relative text-white-dark">
                        <input
                            id="verificationCode"
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="form-input ps-4 placeholder:text-white-dark text-center text-lg tracking-widest"
                            value={enteredCode}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d{0,6}$/.test(value)) setEnteredCode(value);
                            }}
                            maxLength={6}
                        />
                        {codeError && <p className="text-red-500 mt-1">{codeError}</p>}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary !mt-6 w-full uppercase">
                    Verify Account
                </button>

                { <button type="button" className="btn btn-outline-primary w-full" onClick={resendVerification}>
                    Resend Verification Email
                </button> }
            </form>

            <div className="text-center dark:text-white mt-10">
                Already verified? &nbsp;
                <Link to="/" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                    SIGN IN
                </Link>
            </div>
        </div>
    );

    // Registration Form
    const renderRegistrationForm = () => (
        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign Up</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your details to register</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="name">Name</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="name" 
                                            name="name" 
                                            type="text" 
                                            placeholder="Enter Name" 
                                            className={`form-input ps-10 placeholder:text-white-dark ${errors.name ? 'border-red-500' : ''}`} 
                                            value={formData.name}
                                            onChange={handleInputChange} 
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconUser fill={true} />
                                        </span>
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="email" 
                                            name="email" 
                                            type="email" 
                                            placeholder="Enter Email" 
                                            className={`form-input ps-10 placeholder:text-white-dark ${errors.email ? 'border-red-500' : ''}`} 
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="password" 
                                            name="password" 
                                            type="password" 
                                            placeholder="Enter Password" 
                                            className={`form-input ps-10 placeholder:text-white-dark ${errors.password ? 'border-red-500' : ''}`} 
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                                        <span className="text-white-dark">Subscribe to weekly newsletter</span>
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign Up
                                </button>
                            </form>
                                  <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5 text-white">
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconInstagram />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconFacebookCircle />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconTwitter fill={true} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconGoogle />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="text-center dark:text-white">
                                Already have an account ?&nbsp;
                                <Link to="/" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN IN
                                </Link>
                            </div>
                        </div>

    );

    return (
        <div>
            {renderBackground()}

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                {renderLanguageDropdown()}

                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        {isVerificationSent ? renderVerificationUI() : renderRegistrationForm()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterBoxed;
