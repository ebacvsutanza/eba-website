import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const SetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords match
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'https://eba-website.onrender.com/set-password',
                { password },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.Status === "Success") {
                navigate('/userlogin');
            } else {
                setMessage(response.data.Message || 'Failed to set password');
            }
        } catch (error) {
            setMessage(error.response?.data?.Message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="preloader">
                <div className="preloader-content">
                    <div className="cube-loader">
                        <div className="cube"></div>
                        <div className="cube"></div>
                        <div className="cube"></div>
                        <div className="cube"></div>
                        <div className="cube"></div>
                        <div className="cube"></div>
                    </div>
                    <div className="preloader-text">Setting Password...</div>
                </div>
            </div>
        );
    }

    return (
        <div className='login-form'>
            <div className='form'>
                <form onSubmit={handleSubmit}>
                    <div className='title'>
                        <a href='/userlogin' className='login-button'>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </a>
                        <h2>Set Password</h2>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {message && <div className='messages'>{message}</div>}

                    <button type='submit'>Set Password</button>
                    
                    <p className="info-text">
                        Setting a password allows you to sign in using your email and password
                        in addition to Google Sign-In.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;
