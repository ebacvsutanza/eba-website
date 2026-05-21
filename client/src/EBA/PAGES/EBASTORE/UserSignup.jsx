import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import './CSS/Preloader.css';
import { HiArrowLeft } from 'react-icons/hi';

const UserSignin = () => {
	const navigateTo = useNavigate();
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const handleGoogleSuccess = async (credentialResponse) => {
		setLoading(true);
		try {
			// Decode the credential to get user information
			const decoded = jwtDecode(credentialResponse.credential);
			
			// Check if email is from cvsu.edu.ph domain
			if (!decoded.email.endsWith('@cvsu.edu.ph')) {
				setMessage('Please use your CvSU email account (@cvsu.edu.ph)');
				setTimeout(() => setMessage(''), 3000);
				setLoading(false);
				return;
			}

			// Proceed with authentication
			const res = await axios.post('https://eba-website.onrender.com/auth/google', {
				token: credentialResponse.credential,
			});

			localStorage.setItem('token', res.data.token || '');
			navigateTo('/userlogin');
		} catch (err) {
			const errMsg = err.response?.data?.message || 'Google sign-in failed';
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
					<div className="preloader-text">Signing Up...</div>
				</div>
			</div>
		);
	}

	return (
    <div className="h-screen p-3 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('/cvsuback.jpg')] bg-cover bg-center center-flex">
      <div className="lg:w-3/4 xl:w-3/5 h-3/4 bg-(--primary-bg) rounded-xl flex overflow-hidden relative">
        <div class="md:w-1/2 px-5 py-10 text-center flex justify-around flex-col relative">
					<HiArrowLeft className="text-lg cursor-pointer absolute top-5 left-5" onClick={() => navigateTo("/")} />
          <div className="center-flex flex-col gap-3">
            <img
              src="/logo.png"
              alt="CvSU Logo"
              className="w-20 object-contain"
              onClick={() => navigateTo("/")}
            />
            <h1 className="text-3xl text-(--secondary-text) font-heading font-bold">
              Sign Up
            </h1>
            <p className="font-heading text-[16px]">Let’s create your account for EBA</p>
          </div>

          <p className="my-10 font-heading">
            Sign-up using your Google Account from CvSU, this will use details
            such as your name and profile photo to set-up your EBA Profile.{" "}
          </p>

          <div>
            {message && <div className="mb-5 text-(--error)">{message}</div>}

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setMessage("Google Sign-In Failed");
                setTimeout(() => setMessage(""), 3000);
              }}
            />

						<a href="/userlogin" className="underline text-(--secondary-text)">
							Sign in instead
						</a>
          </div>
        </div>

  	    <img src="cvsuback.jpg" alt="" className="w-1/2 h-full object-cover hidden md:block" />
      </div>
    </div>
  );
};

export default UserSignin;
