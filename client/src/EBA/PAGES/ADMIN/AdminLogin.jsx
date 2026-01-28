import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// import InputForm from '../../InputForm';

const Login = () => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	function togglePasswordVisibility() {
			setPasswordVisible(!passwordVisible);
	};

	const [message, setMessage] = useState('');
	const navigateTo = useNavigate();
	const [values, setValues] = useState({
		email: '',
		password: ''
	});

	const inputs = [
		{
			id: 1,
			type: 'email',
			name: 'email',
			placeholder: 'Enter your email address',
			errorMsg: 'Invalid email address', 
			label: 'Email Address',
			required: true
		},
		{
			id: 2,
			type: 'password',
			name: 'password',
			placeholder: 'Enter your password',
			errorMsg: 'Incorrect password', 
			label: 'Password',
			required: true
		}
	]

	const onChange = (e) => {
		setValues({...values, [e.target.name]: e.target.value})
	}

	const loginAdmin = async (e) => {
		e.preventDefault();
	
		try {
			const response = await axios.post('http://localhost:3000/adminlogin', values);
			const { token } = response.data;
			localStorage.setItem('token', token);
		
			const decodedToken = JSON.parse(atob(token.split('.')[1]));
			if (decodedToken.role === "DEAN" || decodedToken.role === "EBA Staff") {
        navigateTo("/adminpanel");
      } else {
        navigateTo("/staffadminpanel");
      }
		} catch (err) {
		  setMessage('Invalid credentials', err);
		}
	};
	
	return (
    <div className="h-screen bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('/cvsuback.jpg')] bg-cover bg-center center-flex">
			<form 
				onSubmit={loginAdmin}
				className='w-1/3 h-3/5 p-8 bg-(--primary-bg) rounded-xl flex flex-col justify-between'
			>
				<div className="space-y-3 text-center">
					<div className="relative">
						<a href="/eba" className="absolute left-0 top-1/2 -translate-y-1/2">
							<FontAwesomeIcon icon={faArrowLeft} />
						</a>
						<h2 className='text-(--secondary-text) font-bold font-heading text-2xl'>LOGIN</h2>
					</div>

					<p>Sign in to access the Admin Panel</p>
				</div>

				<div className="space-y-5">
					<div className="flex flex-col gap-3">
						<label for="email">Email Address</label>
						<input 
							type="email" 
							name="email" 
							placeholder="Enter your email address" 
							value={values.email} 
							onChange={onChange} 
							required 
							className='p-2 rounded-lg border border-gray-500 focus:outline-(--accent)'
						/>
					</div>

					<div className="flex flex-col gap-3">
						<label for="password">Password</label>
						<div className="relative">
							<input 
								type={inputs[1].name === 'password' && passwordVisible ? 'text' : inputs[1].type}
								name="password" 
								placeholder="Enter your password" 
								value={values.password} 
								onChange={onChange} 
								required 
								className="w-full p-2 rounded-lg border border-gray-500 focus:outline-(--accent)"
							/>
							<FontAwesomeIcon icon={!passwordVisible ? faEye : faEyeSlash} onClick={togglePasswordVisibility} className='absolute right-2 bottom-1/2 translate-y-1/2 cursor-pointer'/>
						</div>
					</div>
				</div>

				<div className='space-y-5'>
					<p className='text-(--error) text-center'>{message}</p>

					<button type="submit" className='w-full bg-(--primary-btn) hover:bg-(--accent) transition-all cursor-pointer text-white p-2 rounded-xl'>Login</button>
				</div>
			</form>
    </div>
  );
}

export default Login
