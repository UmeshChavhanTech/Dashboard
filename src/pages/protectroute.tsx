

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Index from '../..';

interface ProtectedRouteProps {
    children?: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/validate', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });

                const data = response.data;

                if (data.valid === true) {
                    setIsValid(true);
                } else {
                    throw new Error(data.message || 'Invalid token');
                }
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setIsValid(false);
            }
        };

        if (token) {
            validateToken();
        } else {
            setIsValid(false);
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (isValid === null) {
        // Validation in progress, render nothing or a loading indicator
        return null;
    }

    if (!isValid) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
