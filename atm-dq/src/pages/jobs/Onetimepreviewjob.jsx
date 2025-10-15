import React, { useState } from "react";
import Layout from "../../layout/Layout";
import Dropdown from "../../components/common/Dropdown";
import Headertext from "../../components/common/Headertext";
import Button from "../../components/common/Button";
import { FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import SearchBar from "../../components/common/Searchbar";
import Pagination from "../../components/common/Pagination";
import { Link } from "react-router-dom";
import Downloadfile from "../../components/common/Downloadfile";
import { GoArrowLeft } from "react-icons/go";

const sampleData = [
  {
    variable: "#20426",
    count: "492",
    health: "647",
    average: "826",
    min: "185",
    max: "536",
    stdev: "447",
  },
  {
    variable: "#20426",
    count: "556",
    health: "426",
    average: "877",
    min: "423",
    max: "583",
    stdev: "357",
  },
  {
    variable: "#20426",
    count: "622",
    health: "344",
    average: "756",
    min: "160",
    max: "253",
    stdev: "563",
  },
  {
    variable: "#20426",
    count: "345",
    health: "653",
    average: "234",
    min: "375",
    max: "745",
    stdev: "143",
  },
  {
    variable: "#20426",
    count: "234",
    health: "953",
    average: "453",
    min: "625",
    max: "142",
    stdev: "523",
  },
];

function Onetimepreviewjob({ maxHeight = "calc(100vh - 450px)" }) {
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Jobs - One Time" />
      <Link to="/jobs/onetimejob">
        <Button text="Jobs" variant="primary" icon={<GoArrowLeft />} />
      </Link>
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



  const filteredData = sampleData.filter(
    (item) =>
      item.variable.toLowerCase().includes(search.toLowerCase()) ||
      item.count.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.health.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.average.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.min.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.max.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.stdev.toString().toLowerCase().includes(search.toLowerCase())
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

 
  return (
    <>
      <Layout header={header}>
        <div className="flex flex-col md:flex-row w-full gap-4">
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
          <div className="w-full md:w-[60%]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-4 bg-white rounded-lg shadow border border-gray-200">
              {/* Plant Info */}

              <div className="text-gray-700">
                <h2 className="font-semibold text-gray-900 mb-2">
                  Job Details
                </h2>
                <div className="flex flex-col gap-2 text-gray-700">
                  <div>
                    <span className="font-medium text-gray-900">Job No:</span>
                    <span className="ml-1">NTI</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-900">User:</span>
                    <span className="ml-1">Bharatesh</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Status:</span>
                    <span className="ml-1">Pending</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-gray-700">
                <div>
                  <span className="font-medium text-gray-900">Interval:</span>
                  <span className="ml-1">45 Sec</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">From Date:</span>
                  <span className="ml-1">12/5/2025</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">To Date:</span>
                  <span className="ml-1">12/12/2025</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    Job Date Time:
                  </span>
                  <span className="ml-1">07/09/2025 10:00 am</span>
                </div>
              </div>

              {/* Data Quality Rules */}
            </div>
          </div>
        </div>

        <div
          className="flex flex-col space-y-4 h-full mt-4"
          style={{ height: "calc(100vh - 385px)" }}
        >
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
                <Downloadfile text="Download File" />
              </div>

              <div>
                <SearchBar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table container with scrollable tbody */}
          <div className="flex flex-col flex-1 overflow-hidden rounded-md">
            <div className="overflow-y-auto scrollbar" style={{ maxHeight }}>
              <table
                className="w-full border-collapse text-left"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th
                      className="px-4 py-2 border-b border-gray-200"
                      style={{ width: "5%" }}
                    >
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
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      style={{ width: "5%" }}
                    >
                      #
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => handleSort("variable")}
                      style={{ width: "25%" }}
                    >
                      <div className="flex items-center gap-1">
                        Variable {getSortIcon("variable")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => handleSort("count")}
                      style={{ width: "15%" }}
                    >
                      <div className="flex items-center gap-1">
                        Count {getSortIcon("count")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => handleSort("health")}
                      style={{ width: "15%" }}
                    >
                      <div className="flex items-center gap-1">
                        %Health{getSortIcon("health")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => handleSort("average")}
                      style={{ width: "15%" }}
                    >
                      <div className="flex items-center gap-1">
                        Average {getSortIcon("average")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => handleSort("min")}
                      style={{ width: "15%" }}
                    >
                      <div className="flex items-center gap-1">
                        Min {getSortIcon("min")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => handleSort("max")}
                      style={{ width: "15%" }}
                    >
                      <div className="flex items-center gap-1">
                        Max {getSortIcon("max")}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 border-b border-gray-200 text-center"
                      style={{ width: "15%" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => {
                      const globalIdx = (page - 1) * perPage + idx;
                      return (
                        <tr
                          key={globalIdx}
                          className="hover:bg-gray-50 border-b border-gray-100"
                        >
                          <td className="px-4 py-2" style={{ width: "5%" }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(idx)}
                              onChange={() => toggleRowSelection(idx)}
                            />
                          </td>
                          <td className="px-4 py-2" style={{ width: "5%" }}>
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2" style={{ width: "25%" }}>
                            {item.variable}
                          </td>
                          <td className="px-4 py-2" style={{ width: "25%" }}>
                            {item.count}
                          </td>
                          <td className="px-4 py-2" style={{ width: "25%" }}>
                            {item.health}
                          </td>
                          <td className="px-4 py-2" style={{ width: "15%" }}>
                            {item.average}
                          </td>
                          <td className="px-4 py-2" style={{ width: "15%" }}>
                            {item.min}
                          </td>
                          <td className="px-4 py-2" style={{ width: "15%" }}>
                            {item.max}
                          </td>
                          <td
                            className="px-4 py-2 text-center"
                            style={{ width: "15%" }}
                          >
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
                        colSpan="8"
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

          {/* Pagination fixed at bottom */}
          <div className="mt-auto">
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
    </>
  );
}

export default Onetimepreviewjob;
