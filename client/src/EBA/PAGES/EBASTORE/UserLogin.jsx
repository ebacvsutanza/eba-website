import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import './CSS/LandingStore.css';
import './CSS/Preloader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const UserLogin = () => {
	const navigateTo = useNavigate();
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);

	const handleGoogleLogin = async (credentialResponse) => {
		setLoading(true);
		try {
			console.log('Google response:', credentialResponse);
			
			const decoded = jwtDecode(credentialResponse.credential);
			console.log('Decoded token:', decoded);
			
			// Check if email is from cvsu.edu.ph domain
			if (!decoded.email.endsWith('@cvsu.edu.ph')) {
				setMessage('Please use your CvSU email account (@cvsu.edu.ph)');
				setTimeout(() => setMessage(''), 3000);
				setLoading(false);
				return;
			}

			// Send token to backend
			console.log('Sending token to backend...');
			const response = await axios.post('http://localhost:3000/userlogin', {
				googleToken: credentialResponse.credential
			});

			const { token } = response.data;
			localStorage.setItem('token', token);
			navigateTo('/ebastore');
		} catch (err) {
			const errMsg = err.response?.data?.message || 'Login failed';
			setMessage(errMsg);
			setTimeout(() => setMessage(''), 3000);
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
					<div className="preloader-text">Logging in...</div>
				</div>
			</div>
		);
	}

	return (
    <div className="cvsu-login-container">
      <div className="cvsu-login-form">
        <div className="cvsu-header">
          <div
            className="cvsu-logo"
            onClick={() => navigateTo("/eba")}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            <h1>SIGN IN</h1>
          </div>

          <div className="cvsu-title">
            <img src="/logo.png" alt="CvSU Logo" className="logo-diamond" />
            <h1>CAVITE STATE UNIVERSITY</h1>
          </div>
        </div>

        <div className="cvsu-form-content">
          <div className="google-signin-description">
            <p>
              To continue, sign in using the Google Account that the campus
              provided.
            </p>
            <small>
              Don't have account? <a href="/usersignup">Click here</a> to
              register.
            </small>
          </div>

          <div className="custom-google-login">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setMessage("Google Sign-In Failed");
                setTimeout(() => setMessage(""), 3000);
              }}
              theme="outline"
              size="large"
              width="100%"
              useOneTap={false}
            />
          </div>

          {message && <div className="error-message">{message}</div>}
        </div>
      </div>
    </div>
  );
}

export default UserLogin