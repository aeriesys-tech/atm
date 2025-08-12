import React, { useState, useEffect } from "react";
import { FiSearch, FiChevronUp, FiChevronDown, FiEdit, FiTrash, FiEye } from "react-icons/fi";
import api from "../services/api";
import Pagination from "./common/Pagination";
import { toast } from "react-toastify";

export default function BatchesTable() {
	const [batches, setBatches] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalRecords, setTotalRecords] = useState(0);
	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState("_id");
	const [sortDirection, setSortDirection] = useState("desc");
	const [deleteConfirm, setDeleteConfirm] = useState({ show: false, batchId: null, batchNo: null });
	const [viewModal, setViewModal] = useState({ show: false, batchId: null, batchNo: null });
	const [variables, setVariables] = useState([]);
	const [variablesLoading, setVariablesLoading] = useState(false);
	const [variablesPage, setVariablesPage] = useState(1);
	const [variablesLimit, setVariablesLimit] = useState(10);
	const [variablesTotalPages, setVariablesTotalPages] = useState(0);
	const [variablesTotalItems, setVariablesTotalItems] = useState(0);
	const [variablesSearch, setVariablesSearch] = useState("");
	const [editingVariable, setEditingVariable] = useState(null);

	// Fetch batches data
	const fetchBatches = async () => {
		setLoading(true);
		try {
			const response = await api.post("/batch/paginateBatches", {
				page,
				limit,
				search,
				sortBy: sortField,
				order: sortDirection
			});

			const { data: responseData, pagination } = response.data.data;
			setBatches(responseData || []);
			setTotalPages(pagination?.totalPages || 0);
			setTotalRecords(pagination?.totalItems || 0);
		} catch (error) {
			console.error("Error fetching batches:", error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch data when dependencies change
	useEffect(() => {
		fetchBatches();
	}, [page, limit, search, sortField, sortDirection]);

	// Handle search with debounce
	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(1); // Reset to first page on search
			fetchBatches();
		}, 500);

		return () => clearTimeout(timer);
	}, [search]);

	// Handle sorting
	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
		setPage(1);
	};

	// Get sort icon
	const getSortIcon = (field) => {
		if (sortField !== field) return null;
		return sortDirection === "asc" ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />;
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString();
	};

	// Handle delete confirmation
	const handleDeleteClick = (batchId, batchNo) => {
		setDeleteConfirm({ show: true, batchId, batchNo });
	};

	// Handle delete confirmation
	const handleDeleteConfirm = async () => {
		try {
			await api.post(`/batch/deleteBatch`, {
				batch_id: deleteConfirm.batchId
			});
			toast.success("Batch deleted successfully");
			setDeleteConfirm({ show: false, batchId: null, batchNo: null });
			fetchBatches(); // Refresh the table
		} catch (error) {
			console.error("Error deleting batch:", error);
			toast.error(error.response?.data?.message || "Failed to delete batch");
		}
	};

	// Handle delete cancel
	const handleDeleteCancel = () => {
		setDeleteConfirm({ show: false, batchId: null, batchNo: null });
	};

	// Handle view click
	const handleViewClick = async (batchId, batchNo) => {
		setViewModal({ show: true, batchId, batchNo });
		setVariablesPage(1); // Reset to first page
		await fetchVariables(batchId, 1, variablesLimit);
	};

	// Fetch variables with pagination
	const fetchVariables = async (batchId, page, limit, search = "") => {
		setVariablesLoading(true);
		try {
			const response = await api.post("/variable/paginateBatchVariables", {
				batch_id: batchId,
				page,
				limit,
				search
			});
			const { data } = response.data;
			setVariables(data?.data || []);
			setVariablesTotalPages(data?.pagination?.totalPages || 0);
			setVariablesTotalItems(data?.pagination?.totalItems || 0);
		} catch (error) {
			console.error("Error fetching variables:", error);
			toast.error("Failed to fetch variables");
			setVariables([]);
		} finally {
			setVariablesLoading(false);
		}
	};

	// Handle variables pagination
	const handleVariablesPageChange = (newPage) => {
		setVariablesPage(newPage);
		fetchVariables(viewModal.batchId, newPage, variablesLimit);
	};

	// Handle variables limit change
	const handleVariablesLimitChange = (newLimit) => {
		setVariablesLimit(newLimit);
		setVariablesPage(1);
		fetchVariables(viewModal.batchId, 1, newLimit);
	};

	// Handle variables search
	const handleVariablesSearch = (searchTerm) => {
		setVariablesSearch(searchTerm);
		setVariablesPage(1);
		fetchVariables(viewModal.batchId, 1, variablesLimit, searchTerm);
	};

	// Handle edit variable
	const handleEditVariable = (variable) => {
		setEditingVariable({ ...variable });
	};

	// Handle save variable
	const handleSaveVariable = async (variableId) => {
		try {
			// Prepare data according to backend API structure
			const updateData = {
				_id: variableId,
				ds_tag_id: editingVariable.ds_tag_id,
				ds_tag_code: editingVariable.ds_tag_code,
				min: editingVariable.min,
				max: editingVariable.max,
				lcl: editingVariable.lcl,
				ucl: editingVariable.ucl,
				flatline_length: editingVariable.flatline_length,
				status: editingVariable.status
			};

			await api.post("/variable/updateVariableDetails", updateData);
			toast.success("Variable updated successfully");
			setEditingVariable(null);
			fetchVariables(viewModal.batchId, variablesPage, variablesLimit, variablesSearch);
		} catch (error) {
			console.error("Error updating variable:", error);
			toast.error("Failed to update variable");
		}
	};

	// Handle cancel edit
	const handleCancelEdit = () => {
		setEditingVariable(null);
	};

	// Handle input change for editing
	const handleEditInputChange = (field, value) => {
		setEditingVariable(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Handle view modal close
	const handleViewClose = () => {
		setViewModal({ show: false, batchId: null, batchNo: null });
		setVariables([]);
	};

	if (loading && batches.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
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
						placeholder="Search batches..."
						className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg w-64"
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
								onClick={() => handleSort("batch_no")}
							>
								<div className="flex items-center justify-center gap-1 text-gray-600">
									<span>Batch No</span>
									{getSortIcon("batch_no")}
								</div>
							</th>
							<th
								className="px-4 py-3 cursor-pointer select-none text-center"
								onClick={() => handleSort("batch_type")}
							>
								<div className="flex items-center justify-center gap-1 text-gray-600">
									<span>Batch Type</span>
									{getSortIcon("batch_type")}
								</div>
							</th>
							<th
								className="px-4 py-3 cursor-pointer select-none text-center"
								onClick={() => handleSort("no_of_tags")}
							>
								<div className="flex items-center justify-center gap-1 text-gray-600">
									<span>No. of Tags</span>
									{getSortIcon("no_of_tags")}
								</div>
							</th>
							<th
								className="px-4 py-3 cursor-pointer select-none text-center"
								onClick={() => handleSort("no_of_attributes")}
							>
								<div className="flex items-center justify-center gap-1 text-gray-600">
									<span>No. of Attributes</span>
									{getSortIcon("no_of_attributes")}
								</div>
							</th>
							<th
								className="px-4 py-3 cursor-pointer select-none text-center"
								onClick={() => handleSort("created_at")}
							>
								<div className="flex items-center justify-center gap-1 text-gray-600">
									<span>Created Date</span>
									{getSortIcon("created_at")}
								</div>
							</th>
							<th className="px-4 py-3 text-center">Actions</th>
						</tr>
					</thead>

					<tbody>
						{batches.map((batch, idx) => (
							<tr key={batch._id || idx} className="border-b border-gray-100 hover:bg-gray-50 odd:bg-white even:bg-gray-50">
								<td className="px-4 py-3 text-center">{(page - 1) * limit + idx + 1}</td>
								<td className="px-4 py-3">
									<div className="text-gray-800 font-medium text-center">{batch.batch_no || "N/A"}</div>
								</td>
								<td className="px-4 py-3 text-center">
									<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
										{batch.batch_type || "N/A"}
									</span>
								</td>
								<td className="px-4 py-3 text-center">
									<span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
										{batch.no_of_tags || "0"}
									</span>
								</td>
								<td className="px-4 py-3 text-center">
									<span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
										{batch.no_of_attributes || "0"}
									</span>
								</td>
								<td className="px-4 py-3 text-gray-600 text-center">
									{formatDate(batch.created_at)}
								</td>
								<td className="px-4 py-3 text-center">
									<div className="flex items-center justify-center gap-2">
										<button
											className="text-blue-600 hover:text-blue-700 cursor-pointer p-1 rounded hover:bg-blue-50"
											title="View Details"
											onClick={() => handleViewClick(batch._id, batch.batch_no)}
										>
											<FiEye className="w-5 h-5" />
										</button>
										<button
											className="text-red-600 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50"
											title="Delete"
											onClick={() => handleDeleteClick(batch._id, batch.batch_no)}
										>
											<FiTrash className="w-5 h-5" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<Pagination
				currentPage={page}
				totalPages={totalPages}
				totalItems={totalRecords}
				itemsPerPage={limit}
				onPageChange={setPage}
			/>

			{/* No data message */}
			{!loading && batches.length === 0 && (
				<div className="text-center py-8 text-gray-500">
					No batches found. {search && "Try adjusting your search criteria."}
				</div>
			)}

			{/* View Variables Modal */}
			{viewModal.show && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<div className="bg-white w-full h-full flex flex-col">
						{/* Header */}
						<div className="flex justify-between items-center p-6 border-b border-gray-200">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">
									Batch #{viewModal.batchNo} Variables
								</h2>
								<p className="text-gray-600 mt-1">
									Total Variables: {variables.length}
								</p>
							</div>
							<button
								onClick={handleViewClose}
								className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full"
							>
								×
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-auto p-6">
							{variablesLoading ? (
								<div className="flex items-center justify-center h-64">
									<div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
								</div>
							) : variables.length > 0 ? (
								<div>
									{/* Variables Controls */}
									<div className="flex justify-between items-center mb-4">
										<div className="flex items-center gap-2 text-sm">
											<span className="text-gray-500">Show</span>
											<select
												value={variablesLimit}
												onChange={(e) => handleVariablesLimitChange(Number(e.target.value))}
												className="border border-gray-300 rounded-lg px-2 py-2"
											>
												<option value={10}>10</option>
												<option value={25}>25</option>
												<option value={50}>50</option>
												<option value={100}>100</option>
											</select>
											<span className="text-gray-500">variables per page</span>
										</div>

										<div className="relative text-sm">
											<FiSearch className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
											<input
												type="text"
												placeholder="Search variables..."
												className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg w-64"
												value={variablesSearch}
												onChange={(e) => handleVariablesSearch(e.target.value)}
											/>
										</div>
									</div>

									<div className="rounded-lg overflow-hidden">
										<table className="min-w-full text-left border-collapse">
											<thead>
												<tr className="bg-gray-50">
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Variable Code
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Description
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														UOM
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														DS Tag Code
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Min
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Max
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														LCL
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														UCL
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Flatline Length
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Status
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Created Date
													</th>
													<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{variables.map((variable, index) => (
													<tr key={variable._id || index} className="border-b border-gray-100 hover:bg-gray-50 odd:bg-white even:bg-gray-50">
														<td className="px-4 py-3 text-sm text-gray-900 font-medium">
															{variable.variable_code || "N/A"}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900">
															{variable.variable_description || "No description"}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900 text-center">
															{variable.uom || "N/A"}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900">
															{editingVariable && editingVariable._id === variable._id ? (
																<input
																	type="text"
																	value={editingVariable.ds_tag_code || ""}
																	onChange={(e) => handleEditInputChange("ds_tag_code", e.target.value)}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
																/>
															) : (
																<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
																	{variable.ds_tag_code || "N/A"}
																</span>
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900 text-center">
															{editingVariable && editingVariable._id === variable._id ? (
																<input
																	type="number"
																	value={editingVariable.min || ""}
																	onChange={(e) => handleEditInputChange("min", Number(e.target.value))}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
																/>
															) : (
																variable.min || "N/A"
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900 text-center">
															{editingVariable && editingVariable._id === variable._id ? (
																<input
																	type="number"
																	value={editingVariable.max || ""}
																	onChange={(e) => handleEditInputChange("max", Number(e.target.value))}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
																/>
															) : (
																variable.max || "N/A"
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900 text-center">
															{editingVariable && editingVariable._id === variable._id ? (
																<input
																	type="number"
																	value={editingVariable.lcl || ""}
																	onChange={(e) => handleEditInputChange("lcl", Number(e.target.value))}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
																/>
															) : (
																variable.lcl || "N/A"
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900 text-center">
															{editingVariable && editingVariable._id === variable._id ? (
																<input
																	type="number"
																	value={editingVariable.ucl || ""}
																	onChange={(e) => handleEditInputChange("ucl", Number(e.target.value))}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
																/>
															) : (
																variable.ucl || "N/A"
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900 text-center">
															{editingVariable && editingVariable._id === variable._id ? (
																<input
																	type="number"
																	value={editingVariable.flatline_length || ""}
																	onChange={(e) => handleEditInputChange("flatline_length", Number(e.target.value))}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
																/>
															) : (
																variable.flatline_length || "N/A"
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900">
															{editingVariable && editingVariable._id === variable._id ? (
																<select
																	value={editingVariable.status ? "true" : "false"}
																	onChange={(e) => handleEditInputChange("status", e.target.value === "true")}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
																>
																	<option value="true">Active</option>
																	<option value="false">Inactive</option>
																</select>
															) : (
																<span className={`px-2 py-1 rounded text-xs ${variable.status === true
																	? 'bg-green-100 text-green-700'
																	: 'bg-gray-100 text-gray-700'
																	}`}>
																	{variable.status === true ? "Active" : "Inactive"}
																</span>
															)}
														</td>
														<td className="px-4 py-3 text-sm text-gray-900">
															{formatDate(variable.created_at)}
														</td>
														<td className="px-4 py-3 text-center">
															{editingVariable && editingVariable._id === variable._id ? (
																<div className="flex items-center justify-center gap-2">
																	<button
																		onClick={() => handleSaveVariable(variable._id)}
																		className="text-green-600 hover:text-green-700 cursor-pointer p-1 rounded hover:bg-green-50"
																		title="Save"
																	>
																		✓
																	</button>
																	<button
																		onClick={handleCancelEdit}
																		className="text-gray-600 hover:text-gray-700 cursor-pointer p-1 rounded hover:bg-gray-50"
																		title="Cancel"
																	>
																		✕
																	</button>
																</div>
															) : (
																<div className="flex items-center justify-center gap-2">
																	<button
																		onClick={() => handleEditVariable(variable)}
																		className="text-green-600 hover:text-green-700 cursor-pointer p-1 rounded hover:bg-green-50"
																		title="Edit"
																	>
																		<FiEdit className="w-4 h-4" />
																	</button>
																</div>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>

										{/* Variables Pagination */}
										{variablesTotalPages > 1 && (
											<div className="mt-6">
												<Pagination
													currentPage={variablesPage}
													totalPages={variablesTotalPages}
													totalItems={variablesTotalItems}
													itemsPerPage={variablesLimit}
													onPageChange={handleVariablesPageChange}
												/>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="text-center py-12">
									<div className="text-gray-400 text-6xl mb-4">📊</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">No Variables Found</h3>
									<p className="text-gray-500">This batch doesn't have any variables yet.</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm.show && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<div className="flex items-center mb-4">
							<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
								<FiTrash className="h-6 w-6 text-red-600" />
							</div>
						</div>
						<div className="text-center mb-6">
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Delete Batch
							</h3>
							<p className="text-sm text-gray-500">
								Are you sure you want to delete batch #{deleteConfirm.batchNo}? This action cannot be undone.
							</p>
						</div>
						<div className="flex gap-3 justify-center">
							<button
								onClick={handleDeleteCancel}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteConfirm}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
