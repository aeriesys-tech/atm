import React from "react";
import Login from "../src/pages/Login"
import OtpVerification from "../src/pages/OTPverification";
import ForgotPassword from "../src/pages/ForgetPassword";


const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/otpverify", element: < OtpVerification /> },
{ path: "/forgotPassword", element: <ForgotPassword /> },
];

export default publicRoutes;