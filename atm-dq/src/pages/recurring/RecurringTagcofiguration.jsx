import React, { useState } from "react";
import { FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";

import Layout from "../../layout/Layout";
import Menubar from "../../components/common/Menubar";
import Dropdown from "../../components/common/Dropdown";
import Headertext from "../../components/common/Headertext";
import SearchBar from "../../components/common/Searchbar";
import Pagination from "../../components/common/Pagination";
import Downloadfile from "../../components/common/Downloadfile";
import Fileinput from "../../components/common/Fileinput";
import Button from "../../components/common/Button";
import { Link } from "react-router-dom";
import RecurringMenubar from "../../components/common/RecurringMenubar";

const sampleData = [
  {
    data: "CEM",
    master: "Business Unit",
    Standardpv: "Calciner String",
    Uom: "ppm",
    min: "105",
    max: "476",
    ucl: "789",
    lcl: "123",
  },
  {
    data: "CEM-CEM",
    master: "Sectors",
    Standardpv: "Outlet",
    Uom: "degC",
    min: "126",
    max: "482",
    ucl: "987",
    lcl: "133",
  },
  {
    data: "CEM-CEM-C",
    master: "Clusters",
    Standardpv: "Nox",
    Uom: "Sec",
    min: "116",
    max: "492",
    ucl: "890",
    lcl: "233",
  },
  {
    data: "CEM-CEM-C Bela Cement Work",
    master: "Plants",
    Standardpv: "Motor bearing",
    Uom: "Ton",
    min: "150",
    max: "468",
    ucl: "990",
    lcl: "156",
  },
  {
    data: "CEM-CEM-C Bela Cement Work-L1",
    master: "Lines",
    Standardpv: "Fan bearing",
    Uom: "m2/kg",
    min: "138",
    max: "419",
    ucl: "920",
    lcl: "165",
  },
  {
    data: "BLCW-RMD::Raw Mix Design System",
    master: "Equipment",
    Standardpv: "Splitter",
    Uom: "rpm",
    min: "144",
    max: "478",
    ucl: "869",
    lcl: "145",
  },
];

function RecurringTagcofiguration({ maxHeight = "calc(100vh - 430px)" }) {
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Create New Job - Recurring" />
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
      item.data.toLowerCase().includes(search.toLowerCase()) ||
      item.master.toString().toLowerCase().includes(search.toLowerCase())
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
        <RecurringMenubar />
        <div className="py-4 flex flex-wrap items-center justify-between">
          <Dropdown
            width="200px"
            options={["ATM", "Use Case", "Direct"]}
            label="ATM"
          />

          <div className="flex flex-wrap mt-2 md:mt-0 items-center gap-2">
            <div className="flex items-center gap-2">
              <Downloadfile text="Download and Edit" />
              <Fileinput />
            </div>
            <Link to="/recurring-dbconnection">
              <Button text="Submit" />
            </Link>
          </div>
        </div>
        <div>
          <div
            className="flex flex-col space-y-4 h-full"
            style={{ height: "calc(100vh - 332px)" }}
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
                <table className="min-w-[1000px] w-full text-left border-collapse table-fixed">
                  <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                    <tr>
                      {/* ✅ Select-all checkbox in header */}
                      <th
                        className="px-4 py-2 border-b border-gray-200 text-center"
                        style={{ width: "5%" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.size === paginatedData.length &&
                            paginatedData.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="cursor-pointer"
                          aria-label="Select all rows"
                        />
                      </th>
                      <th
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        style={{ width: "8%" }}
                      >
                        #
                      </th>
                      <th
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("data")}
                        style={{ width: "32%" }}
                      >
                        <div className="flex items-center gap-1">
                          Variable Code {getSortIcon("data")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("master")}
                        style={{ width: "20%" }}
                      >
                        <div className="flex items-center gap-1">
                          Description {getSortIcon("master")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("Standardpv")}
                        style={{ width: "35%" }}
                      >
                        <div className="flex items-center gap-1">
                          Standard Process Variable {getSortIcon("Standardpv")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("Uom")}
                        style={{ width: "15%" }}
                      >
                        <div className="flex items-center gap-1">
                          UoM {getSortIcon("Uom")}
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
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("ucl")}
                        style={{ width: "15%" }}
                      >
                        <div className="flex items-center gap-1">
                          UCL {getSortIcon("ucl")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleSort("lcl")}
                        style={{ width: "15%" }}
                      >
                        <div className="flex items-center gap-1">
                          LCL {getSortIcon("lcl")}
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 text-center border-b border-gray-200 cursor-pointer"
                        style={{ width: "15%" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, idx) => {
                        const globalIdx = (page - 1) * perPage + idx;
                        const isSelected = selectedRows.has(globalIdx);

                        return (
                          <tr>
                            {/* ✅ Checkbox per row */}
                            <td className="px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRowSelection(globalIdx)}
                                className="cursor-pointer"
                                aria-label={`Select row ${idx + 1}`}
                              />
                            </td>

                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2">{item.data}</td>
                            <td className="px-4 py-2">{item.master}</td>
                            <td className="px-4 py-2">{item.Standardpv}</td>
                            <td className="px-4 py-2">{item.Uom}</td>
                            <td className="px-4 py-2">{item.min}</td>
                            <td className="px-4 py-2">{item.max}</td>
                            <td className="px-4 py-2">{item.ucl}</td>
                            <td className="px-4 py-2">{item.lcl}</td>

                            <td className="px-4 py-2 text-center">
                              <button className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                <FiEdit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
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
        </div>
      </Layout>
    </>
  );
}

export default RecurringTagcofiguration;
