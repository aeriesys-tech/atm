import React, { useState } from 'react';
import mainBanner from '../assets/main_banner.jpg';
import logo from '../assets/AdityaBirlaGroupLogoVector.svg';
import InputField from '../components/common/InputField';
import ActionButton from '../components/common/ActionButton';
import { useNavigate } from 'react-router';

function OtpVerification() {
	const navigate = useNavigate();
	const [otp, setOtp] = useState('');
	const [error, setError] = useState('');
	const handleSubmit = (e) => {
		e.preventDefault();
		if (otp.length !== 6) {
			setError('OTP must be 6 digits');
		} else {
			setError('');
			navigate('/dashboard'); // Navigate only if OTP is valid
		}
	};


	return (
		<div className="container bg-white">
			<div className="row signIn-card">
				<div className="col-lg-6 p-0 pt-4 col-md-12 px-4 mb-4 resp-img">
					<img src={mainBanner} alt="bg-image" className="resp-img-img" />
					<img src={logo} className="banner-logo desktop-logo" alt="logo" />
					<div className="banner-text-container">
						<h1 className="banner-text1">Asset Taxonomy Management</h1>
						<h3 className="banner-text2">ATM - version 1.0</h3>
					</div>
				</div>

				<div className="col-lg-6 col-md-12 p-0 px-4 signin-col align-content-center">
					<h2>Enter OTP</h2>
					<p>Enter the OTP received on your email</p>
					<form className="signin-form" onSubmit={handleSubmit}>
						<InputField
							label="OTP"
							name="otp"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Enter OTP"
							isNumeric
							maxLength={6}
							error={error}
						/>
						<div className="mt-2 mb-2 text-center">Resend OTP in 60 seconds</div>

						{/* <button type="submit" className="signin-form-button">VERIFY</button> */}
						<ActionButton type="submit">VERIFY</ActionButton>
					</form>
				</div>
			</div>

			<div className="d-flex justify-content-between align-content-center px-4 sign-footer-text">
				<p className="w-100">Copyright all rights reserved {new Date().getFullYear()}</p>
				<div className="w-100 d-flex gap-5 justify-content-end sign-footer-text-1">
					<p>Terms Of Use</p>
					<p>Privacy Policy</p>
				</div>
			</div>
		</div>
	);
}

export default OtpVerification;
