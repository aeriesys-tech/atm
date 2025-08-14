import React, { useState } from "react";
import DataSourceTable from "./datasourcepages/DataSourceTable";
import api from "../services/api";
import Loader from "../components/LoaderAndSpinner/Loader";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";

export default function DataSourceConfig() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedId, setSelectedId] = useState(null);
	const [dbType, setDbType] = useState("");
	const [loading, setLoading] = useState(false);
	const [refreshTable, setRefreshTable] = useState(null);
	const [error, setError] = useState({});

	const [formData, setFormData] = useState({
		data_source: "",
		description: "",
		username: "",
		password: "",
		host: "",
		port_no: "",
		database_name: "",
		table_name: "",
		token: "",
		org: "",
		bucket: "",
		url: "",
	});


	const handleEditClick = async (id) => {
		setSelectedId(id); // mark as editing
		setIsModalOpen(true);
		setLoading(true);
		try {
			const res = await api.post(
				"/data-source-configurations/getDataSourceConfiguration",
				{ id }
			);
			const data = res.data.data;
			setFormData({
				data_source: data.data_source || "",
				description: data.description || "",
				username: data.username || "",
				password: data.password || "",
				host: data.host || "",
				port_no: data.port_no || "",
				database_name: data.database_name || "",
				table_name: data.table_name || "",
				token: data.token || "",
				org: data.org || "",
				bucket: data.bucket || "",
				url: data.url || "",
			});
			setDbType(data.data_source || "");
		} catch (err) {
			console.error("Error fetching data source:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	// const handleSubmit = async () => {
	// 	try {
	// 		let payload = {};

	// 		if (dbType === "mysql") {
	// 			payload = {
	// 				data_source: formData.data_source,
	// 				description: formData.description,
	// 				username: formData.username,
	// 				password: formData.password,
	// 				host: formData.host,
	// 				port_no: formData.port_no,
	// 				database_name: formData.database_name,
	// 				table_name: formData.table_name,
	// 			};
	// 		} else {
	// 			payload = { ...formData };
	// 		}

	// 		const res = await api.post("/data-source-configurations/createDataSourceConfiguration", payload);

	// 		console.log("API Success:", res.data);

	// 		setIsModalOpen(false);
	// 		setDbType("");
	// 		setFormValues({});
	// 	} catch (err) {
	// 		console.error("API Error:", err);
	// 		// ❌ Show error message/toast
	// 	}
	// };

	// 	const handleSubmit = async () => {
	// 	setLoading(true)
	//     try {
	//         const payload = { ...formData };

	//         if (selectedId) {
	//             // Update existing
	//             payload.id = selectedId;
	//             const res = await api.post("/data-source-configurations/updateDataSourceConfiguration", payload);
	//             console.log("Updated successfully:", res.data);
	// 	     toast.success("data source updated successfully");
	//         } else {
	//             // Add new
	//             const res = await api.post("/data-source-configurations/createDataSourceConfiguration", payload);
	//             console.log("Created successfully:", res.data);
	// 	    toast.success("Created successfully")
	//         }

	//         // Reset modal
	//         setIsModalOpen(false);
	//         setDbType("");
	//         setSelectedId(null);
	//         setFormData({
	//             data_source: "",
	//             description: "",
	//             username: "",
	//             password: "",
	//             host: "",
	//             port_no: "",
	//             database_name: "",
	//             table_name: "",
	//             token: "",
	//             org: "",
	//             bucket: "",
	//             url: ""
	//         });

	//         // Refresh table or data list
	//           fetchBatches(); // make sure this fetches updated list
	//     } catch (err) {
	//         console.error("Error submitting data source:", err);
	//     }finally{
	// 	setLoading(false)
	//     }
	// };

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const payload = { ...formData };

			if (selectedId) {
				// Update existing
				payload.id = selectedId;
				const res = await api.post(
					"/data-source-configurations/updateDataSourceConfiguration",
					payload
				);
				toast.success(res.data.message);

				if (refreshTable) refreshTable();


			} else {
				// Add new
				const res = await api.post(
					"/data-source-configurations/createDataSourceConfiguration",
					payload
				);
				if (refreshTable) refreshTable();


				toast.success(res.data.message);

			}
			if (refreshTable) refreshTable();
			// Reset modal
			setIsModalOpen(false);
			setDbType("");
			setSelectedId(null);
			setFormData({
				data_source: "",
				description: "",
				username: "",
				password: "",
				host: "",
				port_no: "",
				database_name: "",
				table_name: "",
				token: "",
				org: "",
				bucket: "",
				url: "",
			});

			// Call fetchBatches from DataSourceTable to refresh table
			// triggers fetchBatches in table
		} catch (err) {
			setError(err.response?.data.errors);
			console.log("errorrr", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			{/* Header with Add button */}
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold">Data Source Configuration</h1>
				<button
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
					onClick={() => {
						setDbType("");
						setFormData({
							data_source: "",
							description: "",
							username: "",
							password: "",
							host: "",
							port_no: "",
							database_name: "",
							table_name: "",
							token: "",
							org: "",
							bucket: "",
							url: "",
						});
						setError({}); // Clear errors here
						setIsModalOpen(true);
						setSelectedId(null);
					}}
				>
					<span><FiPlus className="inline w-5 h-5 mr-1" />ADD</span>

				</button>
			</div>

			<DataSourceTable
				onEdit={handleEditClick}
				setRefreshTable={setRefreshTable} // ✅ pass the setter
			/>

			{/* Modal */}

			{isModalOpen && (
				<div className="fixed inset-0  backdrop-blur-sm flex justify-center items-center">
					<div className="bg-gray-50 p-6 rounded-lg shadow-lg w-[320px] relative">
						{/* Header */}
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-bold">New Data Source</h2>
							<button
								onClick={() => {
									setDbType("");
									setFormData({
										data_source: "",
										description: "",
										username: "",
										password: "",
										host: "",
										port_no: "",
										database_name: "",
										table_name: "",
										token: "",
										org: "",
										bucket: "",
										url: "",
									});
									setIsModalOpen(false);
									setError({})
								}}
								className="text-gray-500 hover:text-gray-700 text-xl font-bold"
							>
								✕
							</button>
						</div>

						{/* Database Type */}
						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">
								Data Sources <span className="text-red-500">*</span>
							</label>
							<select
								name="data_source"
								value={formData.data_source}
								onChange={(e) => {
									setDbType(e.target.value);
									handleChange(e);

									// Clear the error for this field
									if (error?.data_source || error?.description) {
										setError((prev) => ({
											...prev,
											data_source: null,
											description: null
										}));
									}

								}}
								className={`w-full border rounded-lg px-3 py-1  focus:outline ${error?.data_source
									? "border-red-500 focus:border-red-500"
									: "border-gray-300 focus:border-gray-400"
									}`}
							>
								<option value="">-- Select Database --</option>
								<option value="mysql">MySQL</option>
								<option value="postgres">PostgreSQL</option>
								<option value="influxdb">InfluxDB</option>
								<option value="mongodb">MongoDB</option>
							</select>
							{error?.data_source && (
								<small className="text-red-500 block ">
									{error.data_source}
								</small>
							)}
						</div>

						{/* MySQL Fields */}
						{dbType === "mysql" && (
							<div className="grid grid-cols-2 gap-4">
				

								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">Username<span className="text-red-500"> *</span></label>
									<input
										type="text"
										name="username"
										value={formData.username}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline  ${error?.username
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter username"
									/>
									{error?.username && <small className="text-red-500 block">{error.username}</small>}
								</div>

								{/* Password */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Password <span className="text-red-500"> *</span>
									</label>
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.password
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter password"
									/>
									{error?.password && (
										<small className="text-red-500 block">
											{error.password}
										</small>
									)}
								</div>

								{/* Hostname */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Hostname <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="host"
										value={formData.host}
										onChange={handleChange}
										//     className="w-full border rounded-lg px-3 py-1"
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.host
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter hostname"
									/>
									{error?.host && (
										<small className="text-red-500 block">{error.host}</small>
									)}
								</div>

								{/* Port No */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Port No <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="port_no"
										value={formData.port_no}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.port_no
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter port number"
									/>
									{error?.port_no && (
										<small className="text-red-500 block">
											{error.port_no}
										</small>
									)}
								</div>

								{/* Database Name */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Database Name <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="database_name"
										value={formData.database_name}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.database_name
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter database name"
									/>
									{error?.database_name && (
										<small className="text-red-500 block">
											{error.database_name}
										</small>
									)}
								</div>

								{/* Table Name */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Table Name  <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="table_name"
										value={formData.table_name}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.table_name
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter table name"
									/>
									{error?.table_name && (
										<small className="text-red-500 block">
											{error.table_name}
										</small>
									)}
								</div>
							</div>
						)}

						{dbType === "postgres" && (
							<div className="grid grid-cols-2 gap-4">
								{/* Username */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Username  <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="username"
										value={formData.username}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.username
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter username"
									/>
									{error?.username && (
										<small className="text-red-500 block">
											{error.username}
										</small>
									)}
								</div>

								{/* Password */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Password  <span className="text-red-500"> *</span>
									</label>
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.password
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter password"
									/>
									{error?.password && (
										<small className="text-red-500 block">
											{error.password}
										</small>
									)}
								</div>

								{/* Hostname */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Hostname <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="host"
										value={formData.host}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.host
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter hostname"
									/>
									{error?.host && (
										<small className="text-red-500 block">{error.host}</small>
									)}
								</div>

								{/* Port No */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Port No
									</label>
									<input
										type="text"
										name="port_no"
										value={formData.port_no}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.port_no
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter port number"
									/>
									{error?.port_no && (
										<small className="text-red-500 block">
											{error.port_no}
										</small>
									)}
								</div>

								{/* Database Name */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Database Name  <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="database_name"
										value={formData.database_name}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.database_name
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter database name"
									/>
									{error?.database_name && (
										<small className="text-red-500 block">
											{error.database_name}
										</small>
									)}
								</div>

								{/* Table Name */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Table Name
									</label>
									<input
										type="text"
										name="table_name"
										value={formData.table_name}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.table_name
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter table name"
									/>
									{error?.table_name && (
										<small className="text-red-500 block">
											{error.table_name}
										</small>
									)}
								</div>
							</div>
						)}

			

						{dbType === "influxdb" && (
							<div className="grid grid-cols-2 gap-4">
								{/* Username */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Username <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="username"
										value={formData.username}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.username
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter username"
									/>
									{error?.username && (
										<small className="text-red-500 block">
											{error.username}
										</small>
									)}
								</div>

								{/* Password */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Password <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="password"
										value={formData.password}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.password
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter password"
									/>
									{error?.password && (
										<small className="text-red-500 block">
											{error.password}
										</small>
									)}
								</div>

								{/* Token */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Token  <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="token"
										value={formData.token}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.token
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter token"
									/>
									{error?.token && (
										<small className="text-red-500 block">
											{error.token}
										</small>
									)}
								</div>

								{/* Org */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">Org <span className="text-red-500"> *</span></label>
									<input
										type="text"
										name="org"
										value={formData.org}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.org
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter org"
									/>
									{error?.org && (
										<small className="text-red-500 block">
											{error.org}
										</small>
									)}
								</div>

								{/* Bucket */}
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1">
										Bucket <span className="text-red-500"> *</span>
									</label>
									<input
										type="text"
										name="bucket"
										value={formData.bucket}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.bucket
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter bucket"
									/>
									{error?.bucket && (
										<small className="text-red-500 block">
											{error.bucket}
										</small>
									)}
								</div>

								{/* You can leave the last column empty if needed */}
							</div>
						)}

						{dbType === "mongodb" && (
							<>
								<div className="mb-0">
									<label className="block text-sm font-medium mb-1"> Url <span className="text-red-500"> *</span></label>
									<input
										type="text"
										name="url"
										value={formData.url}
										onChange={handleChange}
										className={`w-full border rounded-lg px-3 py-1 focus:outline ${error?.url
											? "border-red-500 focus:border-red-500"
											: "border-gray-300 focus:border-gray-400"
											}`}
										placeholder="Enter username"
									/>
									{error?.url && (
										<small className="text-red-500 block">
											{error.url}
										</small>
									)}
								</div>
							</>
						)}
						{/* Description */}
						<div className="mb-3 mt-4">
							<label className="block text-sm font-medium mb-1">Description <span className="text-red-500"> *</span></label>
							<textarea
								// <input
								type="text"
								name="description"
								value={formData.description}
								onChange={handleChange}

								className={` block w-full border rounded-lg px-3 py-1 mb-0  focus:outline ${error?.description
									? "border-red-500 focus:border-red-500"
									: "border-gray-300 focus:border-gray-400"
									}`}
								placeholder="Enter description"
							/>
							{error?.description && <small className="text-red-500 block ">{error.description}</small>}

						</div>




						{/* Buttons */}
						<div className="flex justify-end gap-3">
							{/* <button
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                    onClick={handleClose}
              >
                Close
              </button> */}
							<button
								onClick={() => handleSubmit()}
								className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
							>
								{selectedId ? "Update" : "Submit"}
							</button>
						</div>
					</div>
				</div>
			)}

			{loading && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-50">
					<Loader />
				</div>
			)}
		</div>
	);
}
