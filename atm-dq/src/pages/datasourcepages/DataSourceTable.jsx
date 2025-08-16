import React, { useEffect, useState } from "react";

import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiEdit,
  FiTrash,
  FiEye,
} from "react-icons/fi";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import api from "../../services/api";
import Loader from "../../components/LoaderAndSpinner/Loader";
import UseDebounce from "../../components/hook/UseDebounce";

function DataSourceTable({ onEdit, setRefreshTable }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("data_source"); 
  const [order, setOrder] = useState("asc"); 
  const debouncedSearch = UseDebounce(search, 1300);

  // Fetch batches whenever these values change
  useEffect(() => {
    fetchDataSource();
  }, [page, limit, debouncedSearch, sortBy, order]);

  const fetchDataSource = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        "/data-source-configurations/paginateDataSourceConfigurations",
        { page, limit, search: debouncedSearch, sortBy, order }
      );

      const responseData = response.data;
      console.log("API Response:", responseData);

      setBatches(responseData?.dataSourceConfigurations || []);
      setTotalPages(responseData?.totalPages || 0);
      setTotalRecords(responseData?.totalItems || 0);

      // Keep page state in sync with API
      if (responseData?.currentPage) {
        setPage(responseData.currentPage);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (setRefreshTable) {
      setRefreshTable(() => fetchDataSource); // ✅ store the function itself
    }
  }, [setRefreshTable]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
      fetchDataSource();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  };

  // Sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return order === "asc" ? (
      <FiChevronUp className="w-3 h-3" />
    ) : (
      <FiChevronDown className="w-3 h-3" />
    );
  };

  const handleDeleteConfirm = (id) => {
    setLoading(true);
    api
      .post("/data-source-configurations/destroyDataSourceConfigurations", {
        id: id,
      })
      .then((res) => {
        toast.success(res.data.message);

        fetchDataSource();
        setDeleteConfirm({ show: false, batchId: null, batchNo: null });
      })
      .catch((error) => {
        console.error("Error deleting batch:", error);
      })
      .finally(setLoading(false));
  };

  return (
    <div className="space-y-4 mt-3">
      {/* Table Card */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Show & Search Controls */}
        <div className="flex justify-between items-center">
          {/* Per Page Selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-2 py-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-gray-500">entries</span>
          </div>

          {/* Search */}
          <div className="relative text-sm">
            <FiSearch className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Data Sources..."
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-center">Sl. No</th>
                <th
                  className="px-4 py-3 cursor-pointer select-none text-center"
                  onClick={() => handleSort("Data_source")}
                >
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <span>Data Source</span>
                    {getSortIcon("Data_source")}
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Description</th>

                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((batch, index) => (
                  <tr
                    key={batch._id || index}
                    className="border-b border-gray-100 hover:bg-gray-50 odd:bg-white even:bg-gray-50"
                  >
                    {/* Sl. No */}
                    <td className="px-4 py-3 text-center">{index + 1}</td>

                    {/* Data Source */}
                    <td className="px-4 py-3 text-center">


                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {batch.data_source}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 text-center">
                      {/* <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"> */}
                      {batch.description}
                      {/* </span> */}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-green-600 hover:text-green-700 cursor-pointer p-1 rounded hover:bg-green-50 ml-2"
                          title="Edit Batch"
                          onClick={() => onEdit(batch._id)}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50"
                          title="Delete"
                          onClick={() => handleDeleteConfirm(batch._id)}
                        >
                          <FiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-50">
              <Loader />
            </div>
          )}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalRecords}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default DataSourceTable;
