import React from "react";

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-4 py-2 bg-[#5D616C] rounded-b-lg">
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Info text */}
        <div className="text-sm text-white">
          Showing <span className="font-medium">{start}</span> to{" "}
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-1 text-sm">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-white hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-white hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Pagination;
