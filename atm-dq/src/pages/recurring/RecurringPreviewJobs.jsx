import React, { useState } from "react";
import Layout from "../../layout/Layout";
import Dropdown from "../../components/common/Dropdown";
import Headertext from "../../components/common/Headertext";
import Inputform from "../../components/common/Inputform";
import Button from "../../components/common/Button";
import { FiCheckCircle } from "react-icons/fi";
import RecurringMenubar from "../../components/common/RecurringMenubar";
import { RxCross2 } from "react-icons/rx";

function RecurringPreviewJobs() {
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Create New Job - Recurring" />
    </div>
  );

  const [showModal, setShowModal] = useState(false);

  const handleCreateJob = () => {
    setShowModal(true);
  };

  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState([]);

  const handleAdd = () => {
    if (inputValue.trim() === "") return;
    setItems([...items, inputValue.trim()]);
    setInputValue("");
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <>
      <Layout header={header}>
        <RecurringMenubar />
        <div className="flex flex-col md:flex-row w-full mt-2 gap-4">
          {/* Left Side - Plant Info */}
          <div className="w-full md:w-[30%]">
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
          <div className="w-full md:w-[70%] bg-white p-4 space-y-4 rounded-lg shadow border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
              <Inputform
                type="text"
                label="Sampling Interval"
                placeholder="Enter Sampling Interval"
              />
              <Dropdown
                labelText="Job Frequncy"
                options={["Hourly", "Daily", "Weekly", "Monthly"]}
              />
              <Inputform label="Data Length (minutes)" />
            </div>

            <div className="grid grid-cols-12 gap-2 items-start">
              {/* Left Section → Add Items (6 columns) */}
              <div className="col-span-12 md:col-span-9">
                <div className="relative flex gap-2">
                  <Inputform
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                    placeholder="Add Tags..."
                  />
                  <Button
                    className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    text="Add"
                    onClick={handleAdd}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md"
                    >
                      <span className="text-gray-700">{item}</span>
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                        aria-label="Remove item"
                      >
                        <RxCross2 className="mt-1" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Section → Buttons (6 columns) */}
              <div className="col-span-12 md:col-span-3 flex flex-col md:flex-row gap-2 justify-end">
                <Button
                  onClick={handleCreateJob}
                  text="Run Recurring Job"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>

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

export default RecurringPreviewJobs;
