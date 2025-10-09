import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import Headertext from "../../components/common/Headertext";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import Searchbar from "../../components/common/Searchbar";
import Pagination from "../../components/common/Pagination";
import { FaEye } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineWorkHistory } from "react-icons/md";

// Dummy data
const users = ["Bharatesh"];
const frequencies = ["20 Sec", "30 Sec", "1 Min", "45 Sec"];
const statusOptions = ["Running", "Stopped"];

const sampleData = Array.from({ length: 50 }, (_, idx) => {
  const jobDate = new Date(
    2025,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
    Math.floor(Math.random() * 24),
    Math.floor(Math.random() * 60)
  );

  const scheduleDate = new Date(jobDate);
  scheduleDate.setHours(
    scheduleDate.getHours() + Math.floor(Math.random() * 5)
  );

  return {
    id: idx + 1, // Sl. No
    templateid: `#${Math.floor(Math.random() * 50000) + 50}`,
    planDateTime: jobDate.toLocaleString(),
    scheduledate: scheduleDate.toLocaleString(),
    frequency: ["Daily", "Weekly", "Monthly"][Math.floor(Math.random() * 3)],
    dataLength: `${Math.floor(Math.random() * 100) + 50} mins`,
    interval: frequencies[Math.floor(Math.random() * frequencies.length)],
    user: users[0],
    status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
  };
});

function Recurringjob() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [tableData, setTableData] = useState(sampleData);
  const [jobStatus, setJobStatus] = useState("");
  const navigate = useNavigate();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = () => {
    if (jobStatus === "option1") {
      navigate("/tagconfiguration");
    } else if (jobStatus === "option2") {
      navigate("/recurring-tagconfiguration");
    } else {
      alert("Please select an option before submitting.");
    }
  };

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const newSelected = new Set(prev);
      newSelected.has(idx) ? newSelected.delete(idx) : newSelected.add(idx);
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(paginatedData.map((_, idx) => idx)));
  };

  const toggleRunning = (id) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Running" ? "Stopped" : "Running",
            }
          : item
      )
    );
  };

  const filteredData = tableData.filter(
    (item) =>
      item.status.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search) ||
      item.planDateTime.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.interval.toLowerCase().includes(search.toLowerCase()) ||
      item.templateid.toLowerCase().includes(search.toLowerCase()) ||
      item.frequency.toLowerCase().includes(search.toLowerCase()) ||
      item.dataLength.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / perPage) || 1;
  const paginatedData = filteredData.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedData = [...paginatedData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (typeof valA === "number") {
      return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    }

    return sortConfig.direction === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const getStatusClass = (status) =>
    status === "Running"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <>
      <Layout
        header={
          <div className="flex flex-col md:px-10 px-4 py-2">
            <div className="flex items-center justify-between space-x-6">
              <Headertext Text="Recurring" />
              <Button
                text="New Job"
                variant="primary"
                icon={<FiPlus />}
                onClick={openModal}
              />
            </div>
          </div>
        }
      >
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
                onChange={(value) => setPerPage(Number(value))}
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

          {/* Table */}
          <div className="flex-1 overflow-hidden rounded-md">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <table className="min-w-[1200px] w-full text-left border-collapse table-fixed">
                <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 w-[4%]">
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
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      Sl.No {getSortIcon("id")}
                    </th>
                    <th
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => handleSort("templateid")}
                    >
                      Template ID {getSortIcon("templateid")}
                    </th>
                    <th
                      className="px-4 py-2 cursor-pointer w-40"
                      onClick={() => handleSort("frequency")}
                    >
                      Frequency {getSortIcon("frequency")}
                    </th>
                    <th
                      className="px-4 py-2 cursor-pointer w-40"
                      onClick={() => handleSort("dataLength")}
                    >
                      Data Length {getSortIcon("dataLength")}
                    </th>
                    <th
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => handleSort("interval")}
                    >
                      Interval {getSortIcon("interval")}
                    </th>
                    <th
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => handleSort("user")}
                    >
                      User {getSortIcon("user")}
                    </th>
                    <th
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status {getSortIcon("status")}
                    </th>
                    <th className="px-4 py-2 text-center">Pause/Running</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.length > 0 ? (
                    sortedData.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(idx)}
                            onChange={() => toggleRowSelection(idx)}
                          />
                        </td>
                        <td className="px-4 py-2">{item.id}</td>
                        <td className="px-4 py-2">{item.templateid}</td>
                        <td className="px-4 py-2">{item.frequency}</td>
                        <td className="px-4 py-2">{item.dataLength}</td>
                        <td className="px-4 py-2">{item.interval}</td>
                        <td className="px-4 py-2">{item.user}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-3 py-1 font-semibold rounded-md ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.status === "Running"}
                              onChange={() => toggleRunning(item.id)}
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors duration-300 ${
                                item.status === "Running"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <div
                              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                item.status === "Running" ? "translate-x-5" : ""
                              }`}
                            ></div>
                          </label>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              to="/jobs/history"
                              className="text-pink-500 hover:text-pink-700"
                            >
                              <MdOutlineWorkHistory className="w-4 h-4" />
                            </Link>
                            <Link
                              to="/jobs/recurringpreviewjob"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FaEye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => alert("Delete single item")}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="11"
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

          {/* Pagination */}
          <div className="sticky bottom-0 bg-white z-10">
            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              perPage={perPage}
              totalItems={filteredData.length}
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

export default Recurringjob;
