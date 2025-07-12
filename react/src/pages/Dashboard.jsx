import React, { useState, useRef } from "react";
import Header from "../components/general/Header";
import Footer from "../components/general/Footer";
import Breadcrumb from "../components/general/Breadcrum";
import SubMenu from "../components/common/SubMenu";
import Button from "../components/common/Button";
import Dropdown from "../components/common/Dropdown";
import Table from "../components/common/Table";

const Dashboard = () => {
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Dashboard', href: '#' }
    ];
    const [tableHeaders] = useState([
        { label: "# ID", sortable: true },
        { label: "CODE", sortable: true },
        { label: "EQUIPMENT NAME", sortable: true },
        { label: "SECTOR", sortable: true },
        { label: "TYPE", sortable: true },
        { label: "GROUP" },
        { label: "VARIABLES" },
        { label: "STATUS" },
        { label: "ACTION" },
    ]);
  const [rowData] = useState([
  ["1", "Priority", "PRI", "Plant 1", "Type A", "Group 1", "Var A", "Active"],
  ["2", "Sector", "SEC", "Plant 2", "Type B", "Group 2", "Var B", "Inactive"],
]);


    return (
        <>
            <div className="tb-responsive templatebuilder-body">
                <div className="tb-container pt-3">

                    <Breadcrumb title="Dashboard" items={breadcrumbItems} />
                    <SubMenu />

                    <div className="justify-content-between title-line dash-navbar">
                        <h4 className="align-content-center m-0">&nbsp; Recent Asset List</h4>
                        <div className="d-flex gap-3 buttons">
                            <Dropdown
                                label="Select Asset Class"
                                options={[
                                    { label: "Asset Class 1", value: "class1" },
                                    { label: "Asset Class 2", value: "class2" },
                                    { label: "Asset Class 3", value: "class3" },
                                ]}
                                onChange={(e) => console.log("Selected:", e.target.value)}
                            />
                            <div id="overlay" />
                            <div>
                                <Button name="VIEW ALL" />
                            </div>
                        </div>
                    </div>
                    <Table headers={tableHeaders} rows={rowData} />
                </div>
            </div >
        </>
    );
};

export default Dashboard;
