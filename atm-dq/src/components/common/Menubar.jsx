// src/components/Navbar.jsx

import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { Link, useLocation } from "react-router-dom";

const steps = [
  { name: "Tag Configuration", path: "/tagconfiguration" },
  { name: "DB Connection", path: "/dbconnection" },
  { name: "DQ Configuration", path: "/dqconfiguration" },
  { name: "Preview Job", path: "/previewjob" },
];

const Menubar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const currentStepIndex = steps.findIndex((step) =>
    location.pathname.startsWith(step.path)
  );

  return (
    <div className="md:pb-4 pb-0 border-b border-gray-200">
      <nav className="w-full rounded-b-md">
        {/* Desktop Stepper Menu */}
        <div className="hidden md:flex items-center justify-between overflow-x-auto rounded-b-md">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <React.Fragment key={step.path}>
                <Link
                  to={step.path}
                  className="flex items-center group space-x-2"
                >
                  {/* Number Circle */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2  font-semibold transition duration-200
              ${
                isActive
                  ? "bg-[#8A0000] text-white border-[#8A0000]"
                  : isCompleted
                  ? "bg-[#910303] text-white border-[#910303]"
                  : "bg-gray-100 text-gray-500 border-gray-300"
              }
            `}
                  >
                    {index + 1}
                  </div>

                  {/* Text beside the number */}
                  <span
                    className={`font-medium transition duration-200 ${
                      isActive
                        ? "text-[#8A0000]"
                        : isCompleted
                        ? "text-[#910303]"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </Link>

                {/* Divider between steps */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-45 h-0.5 hidden sm:block transition-colors duration-200 ${
                      index < currentStepIndex - 1
                        ? "bg-[#910303]" // completed line
                        : index === currentStepIndex - 1
                        ? "bg-[#8A0000]" // active line
                        : "bg-gray-300" // upcoming line
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-end">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none p-4"
          >
            {isOpen ? (
              <RxCross2 className="w-6 h-6 text-[#8A0000]" />
            ) : (
              <FiMenu className="w-6 h-6 text-[#8A0000]" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden bg-white shadow-md px-4 pt-2 pb-4 space-y-2">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <React.Fragment key={step.path}>
                  <Link
                    to={step.path}
                    className="flex items-center group space-x-2"
                  >
                    {/* Number Circle */}
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-2  font-semibold transition duration-200
              ${
                isActive
                  ? "bg-[#8A0000] text-white border-[#8A0000]"
                  : isCompleted
                  ? "bg-[#910303] text-white border-[#910303]"
                  : "bg-gray-100 text-gray-500 border-gray-300"
              }
            `}
                    >
                      {index + 1}
                    </div>

                    {/* Text beside the number */}
                    <span
                      className={` font-medium transition duration-200 ${
                        isActive
                          ? "text-[#8A0000]"
                          : isCompleted
                          ? "text-[#910303]"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </Link>

                  {/* Divider between steps */}
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-4 bg-gray-300 mx-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Menubar;
