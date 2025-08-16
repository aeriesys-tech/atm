import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiUpload, FiDownload } from "react-icons/fi";
import BatchesTable from "../components/BatchesTable";
import api from "../services/api";
import Loader from "../components/LoaderAndSpinner/Loader";

export default function TagConfiguration() {
	const fileInputRef = useRef(null);
	const [batchType, setBatchType] = useState("ATM");
	const [file, setFile] = useState(null);
	const [fileError, setFileError] = useState(null);
	const [error, setError] = useState({});
	const [isUploading, setIsUploading] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const handleBatchTypeChange = (e) => {
		setBatchType(e.target.value);
	};

	const handleDownloadFormat = () => {
		window.location.href = "/static/ATM_DQ_DirectUploadTemplate.xlsx";
	};

	// Handle file selection
	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
			setFileError(null); // Clear error on file selection
		}
	};

	// Handle file upload
	const handleUpload = () => {
		if (!file) {
			setFileError("Please select a file to upload");
			return;
		}

		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);
		formData.append("batchType", batchType);

		api.post("/batch/uploadExcel", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}).then((response) => {
			toast.success("File uploaded successfully");
			setFile(null);
			setFileError(null);
			setRefreshKey(prev => prev + 1); // Trigger table refresh
		}).catch((error) => {

			const serverMessage =
				error?.response?.data?.errors?.message || // case 2
				error?.response?.data?.message || // case 1
				"Failed to upload file. Please try again."; // default
			toast.error(serverMessage);
			setError(serverMessage);

		}).finally(() => {
			setIsUploading(false);
		});
	};
	const handleUploadComplete = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<div className="bg-white p-4 rounded-lg">
				<div className="flex flex-row gap-2 items-center">
					<select
						name="batch_type"
						id="batch_type"
						className="border border-gray-300 rounded-md p-2"
						value={batchType}
						onChange={handleBatchTypeChange}
					>
						<option value="ATM">ATM</option>
						<option value="Use Case">Use Case</option>
						<option value="Direct">Direct</option>
					</select>

					{batchType === "Direct" && (
						<>
							<div className="flex flex-col">
								<input
									type="file"
									ref={fileInputRef}
									id="tag_name"
									className={`border ${fileError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
									onChange={handleFileChange}
								/>

								{typeof error === "string" && (
									<small className="text-red-500 block">
										{error}
									</small>
								)}


								{fileError && (
									<p className="text-red-500 text-xs">{fileError}</p>
								)}
							</div>
							<button
								className={`rounded-md px-4 py-2 flex items-center ${isUploading
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
									} text-white`}
								onClick={() => {
									handleUpload();
									handleUploadComplete();
								}}

								disabled={isUploading}
							>
								<FiUpload className="h-4 w-4 mr-2" /> Upload
							</button>
							<button
								className="bg-blue-500 text-white rounded-md px-4 py-2 cursor-pointer hover:bg-blue-600 flex items-center ml-auto"
								onClick={handleDownloadFormat}
							>
								<FiDownload className="h-4 w-4 mr-2" /> Download Format
							</button>
						</>
					)}
				</div>
			</div>
			<div className="bg-white p-4 rounded-lg">
				<BatchesTable key={refreshKey} />
			</div>
			{isUploading && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-50">
					<Loader />
				</div>
			)}
		</>
	);
}
