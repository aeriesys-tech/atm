import React, { useState } from "react";
import Headertext from "../../components/common/Headertext";
import Layout from "../../layout/Layout";
import Button from "../../components/common/Button";
import { FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import Dropdown from "../../components/common/Dropdown";
import Searchbar from "../../components/common/Searchbar";
import Pagination from "../../components/common/Pagination";
import { RxCross2 } from "react-icons/rx";
import { Link } from "react-router-dom";
import Inputform from "../../components/common/Inputform";

// ✅ Adjusted data to match headings

const sampleData = [
  {
    database: "Postgres",
    user: "Bhartesh S.",
    plant: "ACW",
    line: 1,
  },
  {
    database: "Postgres",
    user: "Bhartesh S.",
    plant: "APCW",
    line: 1,
  },
  {
    database: "Inflex DB",
    user: "Bhartesh S.",
    plant: "ACW",
    line: 2,
  },
  {
    database: "Postgres",
    user: "Bhartesh S.",
    plant: "ACW",
    line: 1,
  },
];

function Datbase({ maxHeight = "calc(100vh - 315px)" }) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Database" />
      <Button
        text="New Database"
        variant="primary"
        icon={<FiPlus />}
        onClick={openModal}
      />
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
      item.database.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.plant.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.line.toString().toLowerCase().includes(search.toLowerCase())
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
        <div
          className="flex flex-col space-y-4 h-full"
          style={{ height: "calc(100vh - 215px)" }}
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
                <Searchbar
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table container with scrollable tbody */}
          <div className="flex-1 rounded-lg  bg-white">
            <div className="overflow-x-auto">
              <div
                className="inline-block min-w-full"
                style={{ maxHeight: maxHeight || "calc(100vh - 250px)" }}
              >
                <table className="min-w-[700px] w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-12 border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.size === paginatedData.length &&
                            paginatedData.length > 0
                          }
                          onChange={toggleSelectAll}
                          aria-label="Select all rows"
                        />
                      </th>
                      <th className="p-3 w-12 border-b border-gray-200">#</th>
                      <th
                        className="p-3 min-w-[150px] border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("database")}
                      >
                        <div className="flex items-center gap-1">
                          Database name {getSortIcon("database")}
                        </div>
                      </th>
                      <th
                        className="p-3 min-w-[200px] border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("user")}
                      >
                        <div className="flex items-center gap-1">
                          User {getSortIcon("user")}
                        </div>
                      </th>
                      <th
                        className="p-3 min-w-[200px] border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("plant")}
                      >
                        <div className="flex items-center gap-1">
                          Plant {getSortIcon("plant")}
                        </div>
                      </th>
                      <th
                        className="p-3 min-w-[100px] border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("line")}
                      >
                        <div className="flex items-center gap-1">
                          Line {getSortIcon("line")}
                        </div>
                      </th>
                      <th className="p-3 min-w-[100px] border-b border-gray-200 text-center">
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
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 w-12">
                              <input
                                type="checkbox"
                                checked={selectedRows.has(idx)}
                                onChange={() => toggleRowSelection(idx)}
                                aria-label={`Select row ${idx + 1}`}
                              />
                            </td>
                            <td className="p-3 w-12">{idx + 1}</td>
                            <td className="p-3 min-w-[150px]">
                              {item.database}
                            </td>
                            <td className="p-3 min-w-[200px]">{item.user}</td>
                            <td className="p-3 min-w-[200px]">{item.plant}</td>
                            <td className="p-3 min-w-[100px]">{item.line}</td>
                            <td className="p-3 min-w-[100px] text-center">
                              <div className="flex items-center justify-center gap-4">
                                <button
                                  className="text-blue-500 hover:text-blue-600 transition-colors"
                                  aria-label="Edit item"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => alert("Delete single item")}
                                  className="text-red-500 hover:text-red-600 transition-colors"
                                  aria-label="Delete item"
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
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
            <h3 className="text-lg font-semibold"> Database</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}

          <div className="p-4 overflow-y-auto flex flex-col ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Inputform
                label={
                  <>
                    Database Name<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
              <Inputform
                label={
                  <>
                    Plant<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
              <Inputform
                label={
                  <>
                    Line<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
              <Dropdown
                options={["Postgres", "Inflex DB"]}
                label="Select Database Attributes"
                labelText={
                  <>
                    Database Attributes<span className="text-red-500">*</span>
                  </>
                }
              />
              <Inputform
                label={
                  <>
                    URL<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
              <Inputform
                label={
                  <>
                    Username<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
              <Inputform
                label={
                  <>
                    Password<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
              <Inputform
                label={
                  <>
                    Token<span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <Button text="Cancel" variant="secondary" onClick={closeModal} />
            <Link to="#">
              <Button text="Submit" variant="primary" onClick={closeModal} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Datbase;
