import React, { useEffect, useState } from "react";
import TagConfiguration from "./TagConfigurarion";
export default function TimeSeriesPage() {
	const [activeTab, setActiveTab] = useState("Tag Configuration");
	return (
		<div className="gap-4">
			<h1 className="text-xl font-bold pb-2">DQ For Time Series Data</h1>
			<div className="inline-flex bg-white border border-gray-200 rounded-t-lg overflow-hidden mb-4">
				{["Tag Configuration", "DB Configuration", "DQ Configuration", "Submit Job", "Report"].map((tab) => (
					<button
						key={tab}
						className={`px-4 py-2 font-medium transition ${activeTab === tab
							? "bg-blue-50 text-blue-600 border-b-2 border-blue-500 shadow-inner"
							: "text-gray-700 hover:bg-gray-50 cursor-pointer"
							}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab}
					</button>
				))}
			</div>
			<div className="flex flex-col gap-4">
				{activeTab === "Tag Configuration" && <TagConfiguration />}
				{activeTab === "DB Configuration" && <div>DB Configuration</div>}
				{activeTab === "DQ Configuration" && <div>DQ Configuration</div>}
				{activeTab === "Submit Job" && <div>Submit Job</div>}
				{activeTab === "Report" && <div>Report</div>}
			</div>
		</div>
	);
}
