import React from "react";

const Pagination = ({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	showInfo = true,
	className = ""
}) => {
	if (totalItems === 0) return null;

	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	// Generate only 3 visible page numbers at a time
	const getPageNumbers = () => {
		let start = currentPage - 1;
		let end = currentPage + 1;

		// Adjust for first page edge case
		if (currentPage === 1) {
			start = 1;
			end = Math.min(3, totalPages);
		}

		// Adjust for last page edge case
		if (currentPage === totalPages) {
			end = totalPages;
			start = Math.max(totalPages - 2, 1);
		}

		// Ensure we don't go out of range
		if (start < 1) start = 1;
		if (end > totalPages) end = totalPages;

		const pages = [];
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className={`flex justify-between items-center text-sm text-gray-500 ${className}`}>
			{/* Info Section */}
			{showInfo && (
				<span>
					Showing {startItem} to {endItem} of {totalItems} entries
				</span>
			)}

			{/* Pagination Controls */}
			<div className="flex gap-2">
				<button
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
				>
					First
				</button>

				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
				>
					Prev
				</button>

				{pageNumbers.map((page) => (
					<button
						key={page}
						onClick={() => onPageChange(page)}
						className={`px-3 py-1 rounded border transition-colors ${
							currentPage === page
								? "bg-blue-500 text-white border-blue-500"
								: "hover:bg-gray-50"
						}`}
					>
						{page}
					</button>
				))}

				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
				>
					Next
				</button>

				<button
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
				>
					Last
				</button>
			</div>
		</div>
	);
};

export default Pagination;
