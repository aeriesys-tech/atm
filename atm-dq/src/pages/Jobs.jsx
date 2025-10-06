// Jobs.js
import React, { useState } from "react";
import Layout from "../layout/Layout";
import Headertext from "../components/common/Headertext";
import Button from "../components/common/Button"; // Update path if needed
import { FiEdit, FiEye, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import Dropdown from "../components/common/Dropdown";
import Pagination from "../components/common/Pagination";
import { RxCross2 } from "react-icons/rx";
import Inputform from "../components/common/Inputform";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Searchbar from "../components/common/Searchbar";

// ✅ Adjusted data to match headings
const options = ["completed", "pending", "failed"];
const sampleData = Array.from({ length: 100 }, () => {
  const id = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");

  const planNo = options[Math.floor(Math.random() * options.length)];

  const randomDate = new Date(
    2025,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
    Math.floor(Math.random() * 24),
    Math.floor(Math.random() * 60)
  );

  const planDateTime = randomDate.toLocaleString();

  return {
    id,
    planNo, // this will now represent status
    planDateTime,
  };
});

function Jobs() {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const header = (
    <div className="flex flex-col  md:px-10 px-4 py-2">
      {/* Left side: Header + Menu */}
      <div className="flex items-center justify-between space-x-6">
       <nav className="flex space-x-4  font-medium text-gray-600">
        <NavLink
          to="/jobs/onetimejob"
          className={({ isActive }) =>
            isActive
              ? "text-red-500 transition"
              : "hover:text-red-900 transition"
          }
        >
          One-time Job
        </NavLink>

        <NavLink
          to="/jobs/schedulejob"
          className={({ isActive }) =>
            isActive
              ? "text-red-500 transition"
              : "hover:text-red-900 transition"
          }
        >
          Schedule Job
        </NavLink>

        <NavLink
          to="/jobs/recurringjob"
          className={({ isActive }) =>
            isActive
              ? "text-red-500 transition"
              : "hover:text-red-900 transition"
          }
        >
          Recurring Job
        </NavLink>
      </nav>
        <Button
          text="New Job"
          variant="primary"
          icon={<FiPlus />}
          onClick={openModal}
        />
      </div>
      
    </div>
  );

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Sorting
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Filtering & Sorting
  const filteredData = sampleData.filter(
    (item) =>
      item.planNo.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.planDate.toLowerCase().includes(search.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    return sortConfig.direction === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / perPage) || 1;
  const paginatedData = sortedData.slice((page - 1) * perPage, page * perPage);

  // Selection
  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(idx)) newSelected.delete(idx);
      else newSelected.add(idx);
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, idx) => idx)));
    }
  };

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

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Layout header={header}>
        {/* Outer layout fills vertical space */}
        <div className="flex flex-col h-full min-h-[calc(100vh-215px)] space-y-4">
          {/* Top Controls */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Show</span>
              <Dropdown
                label={perPage.toString()}
                width="70px"
                options={["10", "20", "50", "100"]}
                value={perPage.toString()}
                onChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}
              />
              <span className="text-gray-500">entries</span>
            </div>

            <div className="flex items-center gap-3">
              {selectedRows.size > 0 && (
                <button
                  onClick={() => alert("Bulk delete clicked")}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 h-9 rounded-md hover:bg-red-700 transition"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete ({selectedRows.size})
                </button>
              )}

              <div>
                <Searchbar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Table Container */}
          <div className="flex-1 overflow-hiddenrounded-md">
            {/* Table Head */}
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-200 w-[5%]">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer w-[15%]"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      Job ID {getSortIcon("id")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer w-[25%]"
                    onClick={() => handleSort("planDateTime")}
                  >
                    <div className="flex items-center gap-1">
                      Schedule date time {getSortIcon("planDateTime")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer w-[20%]"
                    onClick={() => handleSort("planNo")} // sort by planNo for Status
                  >
                    <div className="flex items-center gap-1">
                      Status {getSortIcon("planNo")}
                    </div>
                  </th>
                  <th className="px-4 py-2 border-b border-gray-200 text-center w-[20%]">
                    Action
                  </th>
                </tr>
              </thead>
            </table>

            {/* Table Body with Scroll */}
            <div
              className="overflow-y-auto overflow-x-auto scrollba"
              style={{ maxHeight: "calc(100vh - 365px)" }}
            >
              <table className="w-full text-left border-collapse table-fixed">
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => {
                      const globalIdx = (page - 1) * perPage + idx;
                      return (
                        <tr
                          key={globalIdx}
                          className="hover:bg-gray-50 border-b border-gray-100"
                        >
                          <td className="px-4 py-2 w-[5%]">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(idx)}
                              onChange={() => toggleRowSelection(idx)}
                            />
                          </td>
                          <td className="px-4 py-2 w-[15%]">{item.id}</td>
                          <td className="px-4 py-2 w-[25%]">
                            {item.planDateTime}
                          </td>
                          {/* show date + time */}
                          <td className="px-4 py-2 w-[20%]">
                            <span
                              className={`inline-block px-4 py-1 rounded-md text-sm font-semibold ${getStatusClass(
                                item.planNo
                              )}`}
                            >
                              {item.planNo.charAt(0).toUpperCase() +
                                item.planNo.slice(1)}
                            </span>
                          </td>
                          {/* show status */}
                          <td className="px-4 py-2 text-center w-[20%]">
                            <div className="flex items-center justify-center gap-3">
                              <button className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => alert("Delete single item")}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-6 text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination at bottom always */}
          <div className="sticky bottom-0 bg-white z-10 ">
            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              perPage={perPage}
              totalItems={sortedData.length}
            />
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
          className={`bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Create New Jobs</h3>
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

export default Jobs;
