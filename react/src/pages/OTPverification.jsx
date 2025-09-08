import React, { useEffect, useState } from 'react';
import mainBanner from '../assets/main_banner.jpg';
import logo from '../assets/AdityaBirlaGroupLogoVector.svg';
import InputField from '../components/common/InputField';
import ActionButton from '../components/common/ActionButton';
import { useNavigate } from 'react-router';
import Loader from '../components/general/LoaderAndSpinner/Loader'; // Make sure this path is correct
import authWrapper from '../../services/AuthWrapper';
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/user/UserSlice';
import axiosWrapper from '../../services/AxiosWrapper';
function OtpVerification() {
	const navigate = useNavigate();
	const [otp, setOtp] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [countdown, setCountdown] = useState(60);
	const dispatch = useDispatch();

	// ⏱️ Start 60s countdown when email is found
	useEffect(() => {
		const email = sessionStorage.getItem('email');
		if (!email) {
			alert('Email not Entered. Please login again.');
			navigate('/');
		} else {
			// Start countdown
			const interval = setInterval(() => {
				setCountdown((prev) => {
					if (prev === 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		setError('');
		if (otp.length !== 6) {
			setError('OTP must be 6 digits');
			return;
		}

		const email = sessionStorage.getItem("email");
		if (!email) {
			alert("Email not found. Please login again.");
			navigate('/');
			return;
		}

		setLoading(true);
		try {
			const data = await authWrapper('api/v1/validate-otp', { email, otp });
			sessionStorage.setItem("token", data.token);
			sessionStorage.setItem("user", JSON.stringify(data.user));
			sessionStorage.setItem("role", JSON.stringify(data.role));
			sessionStorage.setItem("email", data.user.email);
			console.log(JSON.stringify(data.user))
			dispatch(setUser({
				token: data.token,
				user: JSON.stringify(data.user),
			}));
			const paramTypes = await axiosWrapper("api/v1/parameter-types/getParameterTypes", { method: "POST" });
			sessionStorage.setItem("parameterTypes", JSON.stringify(paramTypes));
			const templateTypes = await axiosWrapper("api/v1/template-types/getAllTemplateTypes", { method: "POST" });
			sessionStorage.setItem("templateTypes", JSON.stringify(templateTypes));
			navigate("/dashboard");
		} catch (err) {
			// console.error(err);
			if (err?.errors?.otp) {
				setError(err.errors.otp);
			} else {
				setError(err.message);
			}
		}
		finally {
			setLoading(false);
		}
	};


	if (loading) return <Loader />;

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
							error={error} // ✅ pass error here
						/>

						<div className="mt-2 mb-2 text-center">
							{countdown > 0
								? `Resend OTP in ${countdown} seconds`
								: "Didn't receive OTP? Try again."}
						</div>

						<ActionButton type="submit">VERIFY</ActionButton>
					</form>
				</div>
			</div>

			<div className="d-flex justify-content-between align-content-center px-4 sign-footer-text">
				<p className="w-100">Copyright © {new Date().getFullYear()}</p>
				<div className="w-100 d-flex gap-5 justify-content-end sign-footer-text-1">
					<p>Terms Of Use</p>
					<p>Privacy Policy</p>
				</div>
			</div>
		</div>
	);
}

export default OtpVerification;
