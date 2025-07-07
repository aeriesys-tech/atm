import React, { useState, useRef } from "react";
import Header from "../../components/general/Header";
import Footer from "../../components/general/Footer";

import Breadcrumb from "../../components/general/Breadcrum";
import SubMenu from "../../components/common/SubMenu";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";

const Master = () => {
    const breadcrumbItems = [
        { label: 'Configure', href: '#' },
        { label: 'Masters', href: '#' }
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
        " Priority",
        "  Sector",
        "  PRI",
        " Plant 1",
        " PRI",
        " Plant 2",
        " PRI",
        " PRI",
        " PRI",
    ]);
    return (
        <>
            <Header />
            <div className="tb-responsive templatebuilder-body">
                <div className="tb-container pt-3">
                    <Breadcrumb title="Masters" items={breadcrumbItems} />
                    <Navbar />
                    <Table headers={tableHeaders} rows={rowData} />
                </div>
            </div >
            <Footer />
        </>
    );
};

export default Master;
