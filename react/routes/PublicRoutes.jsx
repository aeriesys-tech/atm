import React from "react";
import Login from "../src/pages/Login"
import OtpVerification from "../src/pages/OTPverification";
import Master from "../src/pages/configurations/Master";


const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/otpverify", element: < OtpVerification /> },
  // { path: "/master", element: <Master /> },

];

export default publicRoutes;