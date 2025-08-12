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
	// Don't render if only one page
	if (totalPages <= 1) return null;

	// Calculate display range
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	// Generate page numbers with ellipsis
	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5; // Show max 5 page numbers

		if (totalPages <= maxVisible) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			// Calculate start and end of visible range
			let start = Math.max(2, currentPage - 1);
			let end = Math.min(totalPages - 1, currentPage + 1);

			// Adjust if we're near the beginning
			if (currentPage <= 3) {
				end = Math.min(totalPages - 1, 4);
			}

			// Adjust if we're near the end
			if (currentPage >= totalPages - 2) {
				start = Math.max(2, totalPages - 3);
			}

			// Add ellipsis before start if needed
			if (start > 2) {
				pages.push("...");
			}

			// Add visible page numbers
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			// Add ellipsis after end if needed
			if (end < totalPages - 1) {
				pages.push("...");
			}

			// Always show last page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
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
				{/* First Page */}
				<button
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
					title="Go to first page"
				>
					First
				</button>

				{/* Previous Page */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
					title="Go to previous page"
				>
					Prev
				</button>

				{/* Page Numbers */}
				{pageNumbers.map((page, index) => (
					<React.Fragment key={index}>
						{page === "..." ? (
							<span className="px-3 py-1 text-gray-400">...</span>
						) : (
							<button
								onClick={() => onPageChange(page)}
								className={`px-3 py-1 rounded border transition-colors ${currentPage === page
									? "bg-blue-500 text-white border-blue-500"
									: "hover:bg-gray-50"
									}`}
								title={`Go to page ${page}`}
							>
								{page}
							</button>
						)}
					</React.Fragment>
				))}

				{/* Next Page */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
					title="Go to next page"
				>
					Next
				</button>

				{/* Last Page */}
				<button
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
					className="border px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
					title="Go to last page"
				>
					Last
				</button>
			</div>
		</div>
	);
};

export default Pagination;
