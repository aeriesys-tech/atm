import React from 'react'
import logo from "../../assets/images/logo.avif";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <>
     <footer className="bg-white border-t border-gray-200 py-3 px-10 flex flex-wrap items-center justify-between  text-gray-500">
            {/* Left Side - Logo + Copyright */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="AKXA Tech Logo" className="w-12" />
              <div>
                <strong>
                  Copyright © {new Date().getFullYear()}{" "}
                  <Link
                    className="text-[#8A0000] hover:underline"
                    target="_blank"
                    to="https://www.akxatech.com"
                  >
                    AKXA Tech Private Limited
                  </Link>
                  .
                </strong>{" "}
                All rights reserved.
              </div>
            </div>

            {/* Right Side - Version */}
            <div className="text-gray-400">Version No : v1.0.0</div>
          </footer>
    </>
  )
}

export default Footer
