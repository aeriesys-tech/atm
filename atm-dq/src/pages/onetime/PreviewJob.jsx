import React, { useState } from "react";
import Layout from "../../layout/Layout";
import Dropdown from "../../components/common/Dropdown";
import Menubar from "../../components/common/Menubar";
import Headertext from "../../components/common/Headertext";
import Inputform from "../../components/common/Inputform";
import Button from "../../components/common/Button";
import { FiCheckCircle, FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import SearchBar from "../../components/common/Searchbar";
import Pagination from "../../components/common/Pagination";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import Downloadfile from "../../components/common/Downloadfile";

function TagConfiguration() {
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Create New Jobs - One Time" />
    </div>
  );

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [showModal, setShowModal] = useState(false);

  const handleCreateJob = () => {
    setShowModal(true);
  };

  return (
    <>
      <Layout header={header}>
        <Menubar />
        <div className="flex flex-col md:flex-row w-full mt-2 gap-4">
          {/* Left Side - Plant Info */}
          <div className="w-full md:w-[40%]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-4 bg-white rounded-lg shadow border border-gray-200">
              {/* Plant Info */}
              <div className="flex flex-col gap-2 text-gray-700">
                <div>
                  <span className="font-medium text-gray-900">Plant:</span>
                  <span className="ml-1">XYZ</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Line:</span>
                  <span className="ml-1">1</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Source(s):</span>
                  <span className="ml-1">CDH, OSI PI</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    Number of Tags Selected:
                  </span>
                  <span className="ml-1">21</span>
                </div>
              </div>

              {/* Data Quality Rules */}
              <div className="text-gray-700">
                <h2 className="font-semibold text-gray-900 mb-2">
                  Data Quality Rules:
                </h2>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Stagnation</li>
                  <li>Outlier</li>
                  <li>Row Count</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-[60%] bg-white p-4 space-y-4 rounded-lg shadow border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
              <Inputform
                type="text"
                label="Sampling Interval"
                placeholder="Enter Sampling Value"
              />
              <Inputform type="datetime-local" label="From" />
              <Inputform type="datetime-local" label="To" />
            </div>

            <div className="flex flex-col md:flex-row md:justify-end gap-2">
              {/* Remove Link around this button since it triggers loading */}
              <Button
                text="Run Job"
                className="w-full md:w-auto"
                onClick={handleCreateJob}
              />

              <Button
                onClick={openModal}
                text="Schedule this job for Later"
                className="w-full md:w-auto"
              />
            </div>
          </div>
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
          className={`bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold"> Schedule Job</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}

          <div className="p-4 overflow-y-auto flex gap-2 ">
            <Inputform label="Select Date" type="date" />
            <Inputform label="Select Time" type="time" />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <Link to="#">
              <Button text="Cancle" variant="secondary" onClick={closeModal} />
            </Link>
            <Button text="Schedule" variant="primary" onClick={closeModal} />
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FiCheckCircle className="text-green-600 text-2xl" />
              <h2 className="text-lg font-semibold text-green-600">Sucess</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Job No-12876 is created successfully
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowModal(false)}
                text="Close"
                className="w-full md:w-auto"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TagConfiguration;
