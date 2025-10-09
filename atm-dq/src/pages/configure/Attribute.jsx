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
    database: "Database",
    dqRules: "Postages",
    fields: 5,
  },
  {
    database: "DQ Rules",
    dqRules: "Row count",
    fields: 1,
  },
  {
    database: "Database",
    dqRules: "Inflex DB",
    fields: 5,
  },
  {
    database: "DQ Rules",
    dqRules: "Postages",
    fields: 2,
  },
];

function Attribute({ maxHeight = "calc(100vh - 315px)" }) {
  const [toggleStates, setToggleStates] = useState({});
  const [attributeType, setAttributeType] = useState("Database");
  const inputLabel =
    attributeType === "Database"
      ? "Database Name"
      : attributeType === "DQ Rules"
      ? "DQ Rules Name"
      : "Input";
  const [rows, setRows] = useState([{ id: 1 }]);
  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: prev.length + 1 }]);
  };
  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Attribute" />
      <Button
        text="New Attribute"
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
      item.dqRules.toLowerCase().includes(search.toLowerCase()) ||
      item.fields.toString().toLowerCase().includes(search.toLowerCase())
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
          <div className="flex-1 rounded-md bg-white">
            <div className="overflow-x-auto">
              <div
                className="inline-block min-w-full"
                style={{ maxHeight: maxHeight || "calc(100vh - 250px)" }}
              >
                <table className="min-w-[600px] w-full text-left border-collapse">
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
                        onClick={() => handleSort("dqRules")}
                      >
                        <div className="flex items-center gap-1">
                          Attribute Type {getSortIcon("dqRules")}
                        </div>
                      </th>
                      <th
                        className="p-3 min-w-[200px] border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("database")}
                      >
                        <div className="flex items-center gap-1">
                          Database/DQ Rules {getSortIcon("database")}
                        </div>
                      </th>
                      <th
                        className="p-3 min-w-[100px] border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("fields")}
                      >
                        <div className="flex items-center gap-1">
                          No.of.fields {getSortIcon("fields")}
                        </div>
                      </th>
                      <th className="p-3 min-w-[100px] border-b border-gray-200 text-center">
                        Status
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
                            <td className="p-3 min-w-[150px] break-words">
                              {item.dqRules}
                            </td>
                            <td className="p-3 min-w-[200px] break-words">
                              {item.database}
                            </td>
                            <td className="p-3 min-w-[100px]">{item.fields}</td>
                            <td className="p-3 min-w-[100px] text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setToggleStates((prev) => ({
                                    ...prev,
                                    [globalIdx]: !prev[globalIdx],
                                  }))
                                }
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                                  toggleStates[globalIdx]
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                                aria-label={`Toggle status for row ${idx + 1}`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${
                                    toggleStates[globalIdx]
                                      ? "translate-x-5"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </td>
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
          className={`bg-white rounded-lg shadow-lg w-full max-w-7xl mx-4 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Attributes</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}

          <div className="p-4 overflow-y-auto flex flex-col ">
            {/* Existing dropdown and input */}
            <div className="flex gap-4">
              <Dropdown
                labelText={
                  <>
                    Attribute Type<span className="text-red-500">*</span>
                  </>
                }
                options={["Database", "DQ Rules"]}
                label="Select Attribute Type"
                value={attributeType}
                onChange={(val) => setAttributeType(val)}
              />
              <Inputform
                label={
                  <>
                    {inputLabel} <span className="text-red-500">*</span>
                  </>
                }
                type="text"
              />
            </div>

            {/* New table */}

            <div className="space-y-4 mt-4">
              <div className="overflow-x-auto">
                <div className="max-h-[calc(100vh-350px)] overflow-y-auto rounded-md">
                  <table className="min-w-full text-left border border-gray-200">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                          #
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                          Type
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                          Label
                        </th>
                        <th className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                          Field Name
                        </th>

                        <th className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                          Placeholder
                        </th>

                        <th className="px-4 py-2 border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b border-gray-100">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-100">
                            <Dropdown
                              options={["Number", "Text"]}
                              label="Select Type"
                            />
                          </td>
                          <td className="px-4 py-2 border-b border-gray-100">
                            <Inputform />
                          </td>
                          <td className="px-4 py-2 border-b border-gray-100">
                            <Inputform />
                          </td>

                          <td className="px-4 py-2 border-b border-gray-100">
                            <Inputform />
                          </td>

                          <td className="px-4 py-2 border-b border-gray-100">
                            <div className="flex items-center justify-center ">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="text-red-500 hover:text-red-700 px-2 py-2 rounded-md transition flex items-center gap-2"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  text="ADD"
                  variant="bluebtn"
                  icon={<FiPlus />}
                  onClick={handleAddRow}
                />
              </div>
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

export default Attribute;
