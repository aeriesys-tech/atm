import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import InputField from '../components/common/InputField';
import '../assets/css/bootstrap.min.css';
import '../assets/css/sign.css';
import bg_image from '../assets/main_banner.jpg';
import adityabirlarao from '../assets/AdityaBirlaGroupLogoVector.svg';
import navlogo from '../assets/Navlogo.svg';
import passicon from '../assets/icons/Component 26.svg';
import ActionButton from '../components/common/ActionButton';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  console.log(formData)
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullEmail = `${formData.email}@adityabirla.com`;

    const payload = {
      email: fullEmail,
      password: formData.password,
    };

    console.log('Submitting:', payload);

    // ✅ Store a dummy token (replace with real one after API call)
    sessionStorage.setItem("token", "dummy-auth-token");

    // Then navigate
    navigate('/otpverify');
  };



  return (
    <div className="container">
      <div className="row signIn-card">
        <div className="col-lg-6 p-0 pt-4 col-md-12 px-4 mb-4 resp-img">
          <img className="resp-img-img" src={bg_image} alt="bg-image" />
          <img src={adityabirlarao} className="banner-logo desktop-logo" alt="Aditya Birla Logo" />
          <a href="/dashboard">
            <img src={navlogo} className="banner-logo mobile-logo" alt="Nav Logo" />
          </a>
          <div className="banner-text-container">
            <h1 className="banner-text1">Asset Taxonomy Management</h1>
            <h3 className="banner-text2">ATM - version 1.0</h3>
          </div>
        </div>

        <div className="col-lg-6 col-md-12 p-0 px-4 signin-col align-content-center">
          <h2>Sign In</h2>
          <p>Enter your details to sign in to your account</p>
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="d-flex flex-column" style={{ marginBottom: 16, position: 'relative' }}>
              <InputField
                label="Email Id"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="signin-form-input"
              />
              <p className="email-p">@adityabirla.com</p>
            </div>


            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              suffix={<img className="password-icon" src={passicon} alt="toggle password" />}
            />

            <p className="signin-form-fp-text">
              <a href="/forgotPassword">Forgot Password?</a>
            </p>
            {/* <button type="submit" className="signin-form-button">SIGN IN</button> */}
            <ActionButton type="submit">SIGN IN</ActionButton>
          </form>
        </div>
      </div>

      <div className="d-flex justify-content-between align-content-center px-4 sign-footer-text">
        <p className="w-100">Copyright all rights reserved 2025</p>
        <div className="w-100 d-flex gap-5 justify-content-end sign-footer-text-1">
          <p>Terms Of Use</p>
          <p>Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
