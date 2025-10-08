import React, { useState } from "react";
import Layout from "../layout/Layout";
import Headertext from "../components/common/Headertext";
import Button from "../components/common/Button";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [jobStatus, setJobStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (jobStatus === "option1") {
      navigate("/tagconfiguration");
    } else if (jobStatus === "option2") {
      navigate("/recurring-tagconfiguration");
    } else {
      alert("Please select an option before submitting.");
    }
  };
  return (
    <>
      <Layout
        header={
          <div className="flex flex-col md:px-10 px-4 py-2">
            <div className="flex items-center justify-between space-x-6">
              <Headertext Text="Dashboard" />
              <Button
                onClick={openModal}
                text="New Job"
                variant="primary"
                icon={<FiPlus />}
              />
            </div>
          </div>
        }
      >
         <div className="flex flex-col h-full min-h-[calc(100vh-215px)] space-y-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
         </div>

      </Layout>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Create New Job</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}

          <div className="p-4 overflow-y-auto flex flex-col space-y-4">
            <label className="inline-flex items-center space-x-3">
              <input
                type="radio"
                name="jobStatus"
                value="option1"
                className="form-radio w-5 h-5"
                checked={jobStatus === "option1"}
                onChange={() => setJobStatus("option1")}
              />
              <span className="text-lg cursor-pointer">One Time</span>
            </label>

            <label className="inline-flex items-center space-x-3">
              <input
                type="radio"
                name="jobStatus"
                value="option2"
                className="form-radio w-5 h-5"
                checked={jobStatus === "option2"}
                onChange={() => setJobStatus("option2")}
              />
              <span className="text-lg cursor-pointer">Recurring</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <Button text="Cancel" variant="secondary" onClick={closeModal} />

            <Button text="Submit" variant="primary" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
