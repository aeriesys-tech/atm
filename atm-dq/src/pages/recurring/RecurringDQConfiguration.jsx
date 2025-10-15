import React, { useState } from "react";
import Layout from "../../layout/Layout";
import Dropdown from "../../components/common/Dropdown";
import Headertext from "../../components/common/Headertext";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/Searchbar";
import Pagination from "../../components/common/Pagination";
import Inputform from "../../components/common/Inputform";
import { Link } from "react-router-dom";
import RecurringMenubar from "../../components/common/RecurringMenubar";

function RecurringDQConfiguration() {
  const [sampleData] = useState([
    {
      name: "Row Count",
      parameter: "Frequency (minutes or hour), cutoff (percentage)",
    },
    {
      name: "flat line",
      parameter:
        "window period (minutes or hour), ,tolerance (percentage), cutoff (percentage)",
    },
    {
      name: "Stagnation",
      parameter:
        "window period (minutes or hour), ,tolerance (percentage), cutoff (percentage)",
    },
    {
      name: "Outlier",
      parameter: "cutoff (percentage)",
    },
    {
      name: "Spike Index",
      parameter: "tolerance (percentage), cutoff (percentage)",
    },
    {
      name: "Saturation",
      parameter: "cutoff (percentage)",
    },
  ]);
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Create New Job - Recurring" />
    </div>
  );
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());

  const filteredData = sampleData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  const totalPages = Math.ceil(sortedData.length / perPage);
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
    <Layout header={header}>
      <RecurringMenubar />

      <section
        className="flex flex-col h-full"
        style={{ height: "calc(100vh - 265px)" }}
      >
        {/* Top controls */}
        <div className="flex flex-wrap justify-between items-center gap-3 py-4">
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
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/recurring-previewjobs">
              <Button text="Submit" />
            </Link>
          </div>
        </div>

        {/* Table container with scroll */}
        <div className="flex flex-col flex-1 overflow-hidden rounded-md">
          <div
            className="overflow-y-auto scrollbar"
            style={{ maxHeight: "calc(100vh - 390px)" }}
          >
            <table className="min-w-[800px] w-full text-left border-collapse table-fixed">
              <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                <tr>
                  {/* ✅ Select-all checkbox */}
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
                      className="cursor-pointer"
                      aria-label="Select all rows"
                    />
                  </th>

                  <th
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                    style={{ width: "8%" }}
                  >
                    SI NO
                  </th>

                  <th
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer"
                    style={{ width: "25%" }}
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    <div className="flex items-center gap-1">
                      DQ Rule {sortAsc ? "↑" : "↓"}
                    </div>
                  </th>

                  <th
                    className="px-4 py-2 border-b border-gray-200"
                    style={{ width: "25%" }}
                  >
                    Parameter
                  </th>

                  <th
                    className="px-4 py-2 border-b border-gray-200"
                    style={{ width: "20%" }}
                  >
                    Threshold
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => {
                    const globalIdx = (page - 1) * perPage + idx;
                    const isSelected = selectedRows.has(globalIdx);

                    // Parsing parameters
                    const fixedParamStr = item.parameter.replace(
                      "tolerance cutoff",
                      "tolerance, cutoff"
                    );
                    const rawParams = fixedParamStr.split(",");
                    const params = rawParams
                      .map((p) => p.trim())
                      .filter(Boolean);

                    return (
                      <React.Fragment key={globalIdx}>
                        <tr>
                          {/* ✅ Checkbox per row */}
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRowSelection(globalIdx)}
                              className="cursor-pointer"
                              aria-label={`Select row ${globalIdx + 1}`}
                            />
                          </td>

                          <td className="px-4 py-2">{globalIdx + 1}</td>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{params[0]}</td>
                          <td className="px-4 py-2">
                            <Inputform />
                          </td>
                        </tr>

                        {params.slice(1).map((param) => (
                          <tr>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2">{param}</td>
                            <td className="px-4 py-2">
                              <Inputform />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
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
      </section>
    </Layout>
  );
}

export default RecurringDQConfiguration;
