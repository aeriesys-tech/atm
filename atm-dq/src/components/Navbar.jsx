import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/images/logo.avif";

import { FiChevronDown, FiMenu } from "react-icons/fi";
import { AiFillHome } from "react-icons/ai";
import { PiListChecksFill, PiWrenchFill } from "react-icons/pi";
import { BsBellFill, BsPersonFill } from "react-icons/bs";
import { RiSettings2Fill, RiSettings5Fill } from "react-icons/ri";
import { FaDatabase, FaUnlockKeyhole } from "react-icons/fa6";
import {
  BiSolidMessageSquareCheck,
  BiSolidMessageSquareDetail,
  BiSolidMessageSquareDots,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { IoIosListBox } from "react-icons/io";
import { MdEditAttributes } from "react-icons/md";
import { CgAttribution } from "react-icons/cg";

export default function Navbar() {
  const menus = [
    {
      name: "Home",
      to: "/",
      icon: <AiFillHome className="w-4.5 h-4.5 text-[#8A0000]" />,
    },
    {
      name: "Configure",
      icon: <PiWrenchFill className="w-4.5 h-4.5 text-[#8A0000]" />,
      subMenu: [
        {
          name: "Attributes",
          to: "/configure/attribute",
          icon: <CgAttribution className="w-4.5 h-4.5 text-[#8A0000]" />,
        },
        {
          name: "Database",
          to: "/configure/database",
          icon: <FaDatabase className="w-4.5 h-4.5 text-[#8A0000]" />,
        },
        {
          name: "DQ Rule",
          to: "/configure/dqrule",
          icon: <PiListChecksFill className="w-4.5 h-4.5 text-[#8A0000]" />,
        },
      ],
    },

    {
      name: "Jobs",
      icon: <IoIosListBox className="w-4.5 h-4.5 text-[#8A0000]" />,
      subMenu: [
        {
          name: "Job Histroy",
          to: "/jobs/onetimejob",
        },
        {
          name: "Schedule",
          to: "/jobs/schedulejob",
        },
        {
          name: "Recurring",
          to: "/jobs/recurringjob",
        },
      ],
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        configureRef.current &&
        !configureRef.current.contains(event.target)
      ) {
        setIsConfigureOpen(false);
      }
      if (jobsRef.current && !jobsRef.current.contains(event.target)) {
        setIsJobsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  const toggleConfigureMenu = () => {
    setIsConfigureOpen((prev) => !prev);
  };
  const toggleJobsMenu = () => setIsJobsOpen((prev) => !prev);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const jobsRef = useRef(null);
  const configureRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleNotification = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-white px-4 md:px-10 py-4 border-b border-gray-200 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-10">
          {/* Logo & Brand */}
          <Link to="/">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-18 h-10 object-contain" />
              <span className="hidden md:flex text-2xl font-stretch-condensed text-[#8A0000]">
                ADITYA BIRLA
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {menus.map((menu) =>
              menu.subMenu ? (
                <div
                  key={menu.name}
                  className="relative"
                  ref={menu.name === "Configure" ? configureRef : jobsRef}
                >
                  <button
                    onClick={
                      menu.name === "Configure"
                        ? toggleConfigureMenu
                        : toggleJobsMenu
                    }
                    className="text-lg flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                  >
                    {menu.icon}
                    <span>{menu.name}</span>
                    <FiChevronDown
                      className={`w-4 h-4 text-gray-600 mt-0.5 transition-transform duration-200 ${
                        (menu.name === "Configure" && isConfigureOpen) ||
                        (menu.name === "Jobs" && isJobsOpen)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Submenu */}
                  {(menu.name === "Configure" && isConfigureOpen) ||
                  (menu.name === "Jobs" && isJobsOpen) ? (
                    <div className="absolute bg-white mt-5.5 left-[-14px] rounded shadow-md z-50 w-48 border border-gray-200">
                      {menu.subMenu.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.to}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#fff5f5]"
                        >
                          {sub.icon}
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={menu.name}
                  to={menu.to}
                  className="text-lg flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  {menu.icon}
                  <span>{menu.name}</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden border border-gray-200 rounded-md p-2"
            onClick={toggleMobileMenu}
          >
            <FiMenu className="w-5 h-5 text-[#8A0000]" />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotification}
              className="relative focus:outline-none border border-gray-200 rounded-md p-2"
            >
              <BsBellFill className="w-4 h-4 text-[#8A0000]" />
              <span className="absolute top-[-3px] right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-[-90px] top-13 w-64 bg-white border border-gray-200 rounded shadow-md z-50">
                <div className="py-2  text-gray-700">
                  <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#fff5f5] cursor-pointer">
                    <BiSolidMessageSquareDetail className="w-4 h-4 text-[#8A0000]" />
                    New comment on your post
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#fff5f5] cursor-pointer">
                    <BiSolidMessageSquareDots className="w-4 h-4 text-[#8A0000]" />
                    You have a new message
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#fff5f5] cursor-pointer">
                    <BiSolidMessageSquareCheck className="w-4 h-4 text-[#8A0000]" />
                    Your task is complete
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="border border-gray-200 rounded-md p-2">
            <RiSettings5Fill className="w-4 h-4 text-[#8A0000]" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer border border-gray-200 rounded-md py-1 px-2"
              onClick={toggleDropdown}
            >
              <div>
                <span className="w-10 h-10 bg-[#8A0000] text-sm text-white rounded-full py-1 px-1.5">
                  BS
                </span>
              </div>
              <div className="text-left hidden md:block">
                <div className=" font-medium text-gray-800">Bharatesh</div>
              </div>
            </div>

            {/* Profile Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-13 w-48 bg-white border border-gray-200 rounded shadow-md z-50">
                <Link
                  to="#"
                  className="flex gap-2 items-center px-4 py-2 text-gray-700 hover:bg-[#fff5f5]"
                >
                  <BsPersonFill className="w-4 h-4 text-[#8A0000]" />
                  Profile
                </Link>

                <Link
                  to="#"
                  className="flex gap-2 items-center px-4 py-2 text-gray-700 hover:bg-[#fff5f5]"
                >
                  <FaUnlockKeyhole className="w-4 h-4 text-[#8A0000]" />
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mt-3 md:hidden flex flex-col gap-2">
          {menus.map((menu, idx) => {
            const hasSubmenu = !!menu.subMenu;

            return (
              <div key={menu.name}>
                <button
                  onClick={() =>
                    hasSubmenu
                      ? setOpenMobileSubmenu((prev) =>
                          prev === idx ? null : idx
                        )
                      : null
                  }
                  className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    {menu.icon}
                    {menu.name}
                  </div>
                  {hasSubmenu && (
                    <FiChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                        openMobileSubmenu === idx ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Mobile Submenu */}
                {hasSubmenu && openMobileSubmenu === idx && (
                  <div className="ml-6 mt-1 flex flex-col gap-1">
                    {menu.subMenu.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.to}
                        className="flex items-center gap-2  text-gray-600 hover:bg-gray-100 px-3 py-1 rounded"
                      >
                        {sub.icon}
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
