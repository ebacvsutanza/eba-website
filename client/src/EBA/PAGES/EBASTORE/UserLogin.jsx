import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import './CSS/LandingStore.css';
import './CSS/Preloader.css';

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
    <div className="h-screen p-3 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('/cvsuback.jpg')] bg-cover bg-center center-flex">
      <div className="lg:w-3/4 xl:w-3/5 h-3/4 bg-(--primary-bg) rounded-xl flex  overflow-hidden relative">
        <div class="md:w-1/2 px-5 py-10 text-center flex justify-around flex-col">
          <div className="center-flex flex-col gap-3">
            <img
              src="/logo.png"
              alt="CvSU Logo"
              className="w-20 object-contain"
              onClick={() => navigateTo("/eba")}
            />
            <h1 className="text-3xl text-(--secondary-text) font-heading font-bold">
              Sign In
            </h1>
            <p className="font-heading text-[16px]">
              Sign in using an EBA-registered Google Account to continue.
            </p>
          </div>

          <p className="my-10 font-heading">
            Sign in using a Google account that is already inside the EBA Shop
            Database, if you haven’t yet, consider getting your account
            registered first.
          </p>

          <div>
            {message && <div className="mb-5 text-(--error)">{message}</div>}
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

            <p className="mt-3">
              Haven’t registered yet?
              <a
                href="/usersignup"
                className="ml-1 underline text-(--secondary-text)"
              >
                Register your account here.
              </a>
            </p>
          </div>
        </div>

        <img
          src="cvsuback.jpg"
          alt=""
          className="w-1/2 h-full object-cover hidden md:block"
        />
      </div>
    </div>
  );
}

export default UserLogin