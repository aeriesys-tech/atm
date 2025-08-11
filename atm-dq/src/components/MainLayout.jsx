import React, { useState, useEffect, useRef } from "react";
import Logo from "../assets/image/aditya-logo.avif";
import { GoHomeFill } from "react-icons/go";
import {
  MdArrowRight,
  MdKeyboardArrowRight,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import { FaFloppyDisk, FaHeadphones } from "react-icons/fa6";
import { IoIosSettings, IoMdLogOut } from "react-icons/io";
import { CgBell } from "react-icons/cg";
import { IoPersonCircle, IoSettings } from "react-icons/io5";
import { RiArrowRightSFill, RiSettingsFill } from "react-icons/ri";
import { AiFillPieChart, AiFillTool } from "react-icons/ai";
import { HiOutlineLogout } from "react-icons/hi";
import { TbBox, TbHelpOctagonFilled } from "react-icons/tb";
import { FiHeadphones, FiMapPin, FiMenu } from "react-icons/fi";
import { GrCloudDownload } from "react-icons/gr";
import { LuUsers } from "react-icons/lu";
import { PiFloppyDisk } from "react-icons/pi";
import { TiArrowRightThick } from "react-icons/ti";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function MainLayout({ children }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  //--------------------------Tabs-----------------------------------
  const [activeTab, setActiveTab] = useState("tab1");

  const tabStyle = (tab) =>
    `px-4 py-2 text-[15px] ${
      activeTab === tab
        ? "text-blue-600 border-blue-600 bg-blue-700 text-white rounded-md"
        : "text-gray-700 font-semibold border-transparent hover:text-blue-600 hover:bg-blue-300 duration-300 rounded-md hover:text-white"
    }`;

  //--------------------------DQBtns-----------------------------------

  const location = useLocation();

  const btnStyle = (path) =>
    `px-4 py-2 text-[13px] text-center ${
      location.pathname === path
        ? "text-blue-600 border-blue-600 bg-blue-700 text-white rounded-md"
        : "text-gray-700 p-2 hover:bg-blue-300 rounded-lg duration-300"
    }`;

  return (
    <>
      <div className="bg-gray-200 min-h-screen flex flex-col">
        {/*-------------------------------------------NavBar--------------------------------------------------*/}
        <nav
          className="bg-white border-b-1 border-gray-200 px-4 py-2 sticky top-0 left-0"
          ref={dropdownRef}
        >
          <div className="container-fluid flex items-center justify-between">
            <button
              className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center gap-4">
                <img className="w-16" src={Logo} />
                <span className="text-[15px] text-blue-500 font-bold">
                  ATM DQ
                </span>
              </div>
              {/* Menu */}
              <div className=" hidden md:flex space-x-4 items-center ml-10">
                <div className="relative">
                  <button
                    className="navbarmenu-text"
                    onClick={() => toggleDropdown("products")}
                  >
                    <GoHomeFill />
                    Home
                    <MdOutlineKeyboardArrowDown className="mt-1" />
                  </button>
                  {openDropdown === "products" && (
                    <div className="absolute left-0 top-8 mt-2 w-40 bg-white shadow-md rounded-lg border border-slate-200 z-10 py-2">
                      <a href="#" className="navbarmenu-subtext">
                        New
                      </a>
                      <a href="#" className="navbarmenu-subtext">
                        Popular
                      </a>
                      <a href="#" className="navbarmenu-subtext">
                        Sale
                      </a>
                    </div>
                  )}
                </div>

                <a href="#" className="navbarmenu-text">
                  <AiFillTool />
                  Configure
                </a>
                <a href="#" className="navbarmenu-text">
                  <FaFloppyDisk />
                  Templates
                </a>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className="navbarright-icons"
                >
                  <CgBell className="w-5 h-5" />
                  <span className="absolute left-5 bottom-4 inline-block w-4 h-4 bg-red-500 rounded-full text-[10px] text-white">
                    3
                  </span>
                </button>
                {openDropdown === "notifications" && (
                  <div className="absolute right-0 left-[-70px] top-8.5 mt-2 w-64 bg-white rounded shadow-lg z-10 border border-slate-200">
                    <div className="p-4 border-b font-medium">
                      Notifications
                    </div>
                    <a href="#" className="navbarmenu-subtext">
                      New message from John
                    </a>
                    <a href="#" className="navbarmenu-subtext">
                      Server rebooted
                    </a>
                    <a href="#" className="navbarmenu-subtext">
                      New comment on post
                    </a>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                //   onClick={() => toggleDropdown("setting")}
                className="navbarright-icons"
              >
                <IoIosSettings className="w-5 h-5" />
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("profile")}
                  className="flex items-center space-x-2 focus:outline-none border-1 p-1 rounded-lg px-2 border-slate-300"
                >
                  <img
                    src="https://i.pravatar.cc/32"
                    alt="Avatar"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-gray-700 text-[13px] font-medium">
                    John Deo
                  </span>
                  <MdOutlineKeyboardArrowDown className="mt-1" />
                </button>
                {openDropdown === "profile" && (
                  <div className="absolute right-0 top-8.5 mt-2 w-40 bg-white shadow-lg rounded-lg z-10 py-2 border border-slate-200">
                    <a href="#" className="navbarmenu-subtext">
                      <IoPersonCircle className="w-4 h-4 text-gray-700" />
                      Profile
                    </a>
                    <a href="#" className="navbarmenu-subtext">
                      <RiSettingsFill className="w-4 h-4 text-gray-700" />
                      Settings
                    </a>
                    <a href="#" className="navbarmenu-subtext">
                      <HiOutlineLogout className="w-4 h-4 text-gray-700" />
                      Logout
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-2 space-y-2">
              <div className="flex flex-col space-y-4">
                {/* Home Dropdown */}
                <button
                  onClick={() => toggleDropdown("products")}
                  className="navbarmenu-text"
                >
                  <span className="flex items-center gap-2">Home</span>
                  <MdOutlineKeyboardArrowDown />
                </button>
                {openDropdown === "products" && (
                  <div className=" space-y-1 ml-4">
                    <a href="#" className="navbarmenu-subtext">
                      New
                    </a>
                    <a href="#" className="navbarmenu-subtext">
                      Popular
                    </a>
                    <a href="#" className="navbarmenu-subtext">
                      Sale
                    </a>
                  </div>
                )}

                <a href="#" className="navbarmenu-text">
                  Configure
                </a>
                <a href="#" className="navbarmenu-text">
                  Templates
                </a>
              </div>
            </div>
          )}
        </nav>
        {/*-------------------------------------------Dashboard--------------------------------------------------*/}
        <div className="mt-4 px-4">
          <div className="w-full mx-auto">
            {/* Tab Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                className={tabStyle("tab1")}
                onClick={() => setActiveTab("tab1")}
              >
                DQ FOR TIME SERIES DATA
              </button>
              <button
                className={tabStyle("tab2")}
                onClick={() => setActiveTab("tab2")}
              >
                DQ FOR STATIC DATA
              </button>
            </div>

            {/* SubTab Content */}
            <div className="mt-4">
              {activeTab === "tab1" && (
                <div className="p-2 rounded shadow bg-[#F1F3FF]">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <Link to="/tagconfig" className={btnStyle("/tagconfig")}>
                      TAG CONFIGURATION
                    </Link>
                    <Link to="/dbconfig" className={btnStyle("/dbconfig")}>
                      DB CONFIGURATION
                    </Link>
                    <Link to="/dqconfig" className={btnStyle("/dqconfig")}>
                      DQ CONFIGURATION
                    </Link>
                    <Link to="/submitjob" className={btnStyle("/submitjob")}>
                      SUBMIT JOB
                    </Link>
                    <Link
                      to="/reportsettings"
                      className={btnStyle("/reportsettings")}
                    >
                      REPORT SETTINGS
                    </Link>
                  </div>
                </div>
              )}
              {activeTab === "tab2" && (
                <div className="p-4 bg-white rounded shadow">
                  DQ CONTENT FOR STATIC DATA
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 mx-4 p-4 border border-gray-300 rounded-lg bg-white flex-grow overflow-auto mb-2">
          {children}
        </div>
      </div>
    </>
  );
}

export default MainLayout;
