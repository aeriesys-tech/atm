import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import InputField from '../components/common/InputField';
import ActionButton from '../components/common/ActionButton';

import '../assets/css/bootstrap.min.css';
import '../assets/css/sign.css';

import bg_image from '../assets/main_banner.jpg';
import adityabirlalogo from '../assets/AdityaBirlaGroupLogoVector.svg';
import navlogo from '../assets/Navlogo.svg';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullEmail = `${email}@adityabirla.com`;

        const payload = {
            email: fullEmail,
        };

        // console.log('Forgot Password Request:', payload);
        // navigate('/some-confirmation-screen');
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-6 p-0 pt-4 col-md-12 px-4 mb-4 resp-img">
                    <img className="resp-img-img" src={bg_image} alt="bg-image" />
                    <img src={adityabirlalogo} className="banner-logo desktop-logo" alt="Aditya Birla Logo" />
                    <img src={navlogo} className="banner-logo mobile-logo" alt="Nav Logo" />
                    <div className="banner-text-container">
                        <h1 className="banner-text1">Asset Taxonomy Management</h1>
                        <h3 className="banner-text2">ATM - version 1.0</h3>
                    </div>
                </div>

                <div className="mobile-header col-lg-6 col-md-12 text-center py-5">
                    <img src={adityabirlalogo} alt="Mobile Logo" />
                </div>

                <div className="col-lg-6 col-md-12 mt-5 p-0 px-4 signin-col align-content-center signIn-card">
                    <h2>Forgot Password</h2>
                    <p>
                        Please enter your email address. You will receive a link to create a new password via email.
                    </p>
                    <form className="signin-form" onSubmit={handleSubmit}>
                        <div className="d-flex flex-column" style={{  position: 'relative' }}>
                            <InputField
                                label="Email Id"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className="signin-form-input"
                            />
                            <p className="email-p">@adityabirla.com</p>
                            <p className="signin-form-fp-text">
                                <Link to="/">Back to Login ?</Link>
                            </p>
                        </div>

                        <ActionButton type="submit">SEND LINK</ActionButton>
                    </form>
                </div>
            </div>

            <div className="d-flex justify-content-between align-content-center px-4 sign-footer-text-fp">
                <p className="w-100">Copyright all rights reserved 2025</p>
                <div className="w-100 d-flex gap-4 justify-content-end sign-footer-text-1">
                    <p>Terms Of Use</p>
                    <p>Privacy Policy</p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
