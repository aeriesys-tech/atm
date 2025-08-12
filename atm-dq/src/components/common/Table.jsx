import { useState } from "react";
import {
	FiFolder,
	FiEdit,
	FiTrash,
	FiChevronUp,
	FiChevronDown,
	FiSearch,
} from "react-icons/fi";

const sampleData = Array.from({ length: 50000 }, (_, idx) => ({
	name: `Category ${idx + 1}`,
	description: `Description for Description Description category Description Description  ${idx + 1}`,
	createdBy: `User ${idx + 1}`,
	status: idx % 2 === 0,
}));

export default function Table() {
	const [sortAsc, setSortAsc] = useState(true);
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(25);
	const [search, setSearch] = useState("");

	const filteredData = sampleData.filter((item) =>
		item.name.toLowerCase().includes(search.toLowerCase())
	);

	const sortedData = [...filteredData].sort((a, b) =>
		sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
	);

	const totalPages = Math.ceil(sortedData.length / perPage);
	const paginatedData = sortedData.slice((page - 1) * perPage, page * perPage);

	const toggleStatus = (globalIdx) => {
		sampleData[globalIdx].status = !sampleData[globalIdx].status;
		setPage(page);
	};

	return (
		<div className="space-y-4">
			{/* Per Page & Search */}
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2 text-sm">
					<span className="text-gray-500">Show</span>
					<select
						value={perPage}
						onChange={(e) => {
							setPerPage(Number(e.target.value));
							setPage(1);
						}}
						className="border border-gray-300 rounded-lg px-2 py-2"
					>
						<option>25</option>
						<option>50</option>
						<option>75</option>
						<option>100</option>
					</select>
					<span className="text-gray-500">entries</span>
				</div>

				<div className="relative text-sm">
					<FiSearch className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Search..."
						className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			<div className="rounded-lg scrollbar transition-all">
				<div className="">
					<table className="min-w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-gray-200 bg-gray-50 text-gray-500 text-xs uppercase">
								<th className="px-4 py-3 text-center">
									<input type="checkbox" />
								</th>
								<th className="px-4 py-3 text-center">Sl. No</th>
								<th
									className="px-4 py-3 cursor-pointer select-none"
									onClick={() => setSortAsc(!sortAsc)}
								>
									<div className="flex items-center gap-1 text-gray-600">
										<span>Project Category</span>
										{sortAsc ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
									</div>
								</th>
								<th className="px-4 py-3">Created By</th>
								<th className="px-4 py-3 text-center">Status</th>
								<th className="px-4 py-3">Actions</th>
							</tr>
						</thead>

						<tbody>
							{paginatedData.map((cat, idx) => {
								const globalIdx = (page - 1) * perPage + idx;
								return (
									<tr key={globalIdx} className="border-b border-gray-100 hover:bg-gray-50 odd:bg-white even:bg-gray-50">
										<td className="px-4 py-1 text-center">
											<input type="checkbox" />
										</td>
										<td className="px-4 py-1 text-center">{globalIdx + 1}</td>
										<td className="px-4 py-1">
											<div className="flex items-start gap-3">
												<FiFolder className="w-5 h-5 mt-2 text-gray-400" />
												<div>
													<div className="text-gray-800">{cat.name}</div>
													<div className="text-xs text-gray-500">{cat.description}</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-1">
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-xs font-semibold text-blue-600 relative group"
													title={cat.createdBy}
												>
													{cat.createdBy
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</div>
												<span className="text-gray-700">{cat.createdBy}</span>
											</div>
										</td>
										<td className="px-4 py-1 text-center">
											<button
												onClick={() => toggleStatus(globalIdx)}
												className={`px-3 py-1 rounded text-xs font-medium ${sampleData[globalIdx].status
													? "bg-green-100 text-green-700"
													: "bg-gray-100 text-gray-500"
													}`}
											>
												{sampleData[globalIdx].status ? "Active" : "Inactive"}
											</button>

										</td>
										<td className="px-4 py-1">
											<div className="flex items-center gap-3">
												<button className="text-blue-600 hover:text-blue-700 cursor-pointer" title="Edit">
													<FiEdit className="w-5 h-5" />
												</button>
												<button className="text-red-600 hover:text-red-700 cursor-pointer" title="Delete">
													<FiTrash className="w-5 h-5" />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Smart Pagination with Ellipsis */}
			<div className="flex justify-between items-center text-sm text-gray-500">
				<span>
					Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, sortedData.length)} of {sortedData.length} entries
				</span>
				<div className="flex gap-2">
					<button
						onClick={() => setPage(1)}
						disabled={page === 1}
						className="border px-3 py-1 rounded disabled:opacity-50"
					>
						First
					</button>
					<button
						onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
						disabled={page === 1}
						className="border px-3 py-1 rounded disabled:opacity-50"
					>
						Prev
					</button>

					{Array.from({ length: totalPages }, (_, idx) => idx + 1)
						.filter(
							(n) =>
								n === 1 ||
								n === totalPages ||
								Math.abs(page - n) <= 1
						)
						.map((n, idx, arr) => (
							<>
								{idx > 0 && n - arr[idx - 1] > 1 && <span key={`ellipsis-${n}`}>...</span>}
								<button
									key={n}
									onClick={() => setPage(n)}
									className={`px-3 py-1 rounded border ${page === n
										? "bg-blue-500 text-white border-blue-500"
										: "hover:bg-gray-50"
										}`}
								>
									{n}
								</button>
							</>
						))}

					<button
						onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={page === totalPages}
						className="border px-3 py-1 rounded disabled:opacity-50"
					>
						Next
					</button>
					<button
						onClick={() => setPage(totalPages)}
						disabled={page === totalPages}
						className="border px-3 py-1 rounded disabled:opacity-50"
					>
						Last
					</button>
				</div>
			</div>
		</div >
	);
}
