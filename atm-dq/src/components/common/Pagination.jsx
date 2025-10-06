// components/common/Pagination.jsx
export default function Pagination({
  page,
  totalPages,
  setPage,
  perPage,
  totalItems,
}) {
  return (
    <div className="flex flex-wrap justify-between items-center  text-gray-600">
      {/* Left: entries info */}
      <span>
        {totalItems > 0
          ? `Showing ${(page - 1) * perPage + 1} to ${Math.min(
              page * perPage,
              totalItems
            )} of ${totalItems} entries`
          : "No entries available"}
      </span>

      {/* Right: page navigation */}
      <div className="flex gap-1 mt-2 md:mt-0">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="px-3 py-0.5 border border-gray-400 rounded-md disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
        >
          First
        </button>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-0.5 border border-gray-400 rounded-md disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, idx) => idx + 1)
          .filter((n) => n === 1 || n === totalPages || Math.abs(page - n) <= 1)
          .map((n, idx, arr) => (
            <span key={n}>
              {idx > 0 && n - arr[idx - 1] > 1 && (
                <span className="px-2">...</span>
              )}
              <button
                onClick={() => setPage(n)}
                className={`px-3 py-0.5 rounded-md border ${
                  page === n
                    ? "bg-[#8A0000] text-white border-[#8A0000]"
                    : "hover:bg-gray-100 border-gray-400 cursor-pointer"
                }`}
              >
                {n}
              </button>
            </span>
          ))}

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-0.5 border border-gray-400 rounded-md disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
        >
          Next
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="px-3 py-0.5 border border-gray-400 rounded-md disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
        >
          Last
        </button>
      </div>
    </div>
  );
}
