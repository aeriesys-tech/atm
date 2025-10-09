import React, { useRef } from "react";
import profile from "../assets/images/profile.webp";
import { MdAlternateEmail } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { AiFillHome } from "react-icons/ai";
import { LuInstagram } from "react-icons/lu";
import { FaCamera, FaFacebook } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import Inputform from "../components/common/Inputform";
import Layout from "../layout/Layout";
import Headertext from "../components/common/Headertext";
import Button from "../components/common/Button";
import Dropdown from "../components/common/Dropdown";
import { Link } from "react-router-dom";

function Profile() {
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Profile" />
    </div>
  );
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  return (
    <>
      <Layout header={header}>
        <div className="h-screen max-h-[calc(100vh-220px)] grid grid-cols-1 md:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Profile Panel - 1 column on mobile, 1/4 width on md+ */}
          <div className="col-span-1 sm:col-span-1 bg-gray-100 rounded-lg p-4 flex flex-col overflow-hidden">
            {/* Profile Top */}
            <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <img
                    src={profile}
                    alt="Profile"
                    className="w-50 h-50 object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="absolute bottom-2 right-4 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-md font-semibold text-gray-800">
                    John Doe
                  </h2>
                  <p className=" text-gray-500">Admin</p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Contact Info - Scrollable */}
              <div className="flex flex-col gap-6  mt-4">
                <span className="flex items-center gap-3 ">
                  <MdAlternateEmail className="text-blue-500 w-4 h-4" />
                  bharatesh0@gmail.com
                </span>
                <span className="flex items-center gap-3">
                  <IoCall className="text-blue-500 w-4 h-4" />
                  +91 98765-43210
                </span>
                <span className="flex items-center gap-3">
                  <TbWorld className="text-blue-500 w-4 h-4" />
                  www.baratesh.com
                </span>
                <span className="flex items-center gap-3">
                  <AiFillHome className="text-blue-500 w-4 h-4" />
                  www.baratesh.com
                </span>
                <span className="flex items-center gap-3">
                  <LuInstagram className="text-blue-500 w-4 h-4" />
                  baratesh@instagram
                </span>
                <span className="flex items-center gap-3">
                  <FaFacebook className="text-blue-500 w-4 h-4" />
                  baratesh@facebook
                </span>
              </div>
            </div>
          </div>

          {/* Right Form Panel - takes 3 columns on md+ */}
          <div className="col-span-1 sm:col-span-3 flex flex-col overflow-hidden">
            <div className="w-full bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-600">
                  User Details
                </h2>
                <div className="flex gap-2">
                  <Button text="Clear" variant="secondary" />
                  <Link to="/">
                    <Button text="Save Changes" variant="primary" />
                  </Link>
                </div>
              </div>

              {/* Form Scrollable */}
              <form className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)]space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Inputform
                    label="First Name"
                    placeholder="Enter first name"
                  />
                  <Inputform label="Last Name" placeholder="Enter last name" />
                  <Inputform label="Email" placeholder="Enter email" />
                  <Dropdown
                    labelText="Gender"
                    label="select Gender"
                    options={["Male", "Femail", "Others"]}
                  />
                  <Inputform label="Phone" placeholder="Enter phone number" />
                  <Inputform label="Address" placeholder="Enter address" />
                  <Inputform label="City" placeholder="Enter city" />
                  <Inputform label="State" placeholder="Enter state" />
                  <Inputform label="Pin no" placeholder="123-456" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Profile;
