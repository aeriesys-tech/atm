import React, { useState } from 'react'
// import Header from '../../components/Header'
// import Breadcrum from '../../components/Breadcrum'
import Breadcrum from '../components/general/Breadcrum'
import SubMenu from '../components/common/SubMenu'
import Button from '../components/common/Button'
import Dropdown from '../components/common/Dropdown'
import Table from '../components/common/Table'
// import Footer from '../../components/Footer'
import Pagination from '../components/general/Pagination'
import Table2 from '../components/common/Table2'
import Footer from '../components/general/Footer'
import Header from '../components/general/Header'

function Dashboardd() {
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
    const [options] = useState([

        { label: "Asset Class 1", value: "class1" },
        { label: "Asset Class 2", value: "class2" },
        { label: "Asset Class 3", value: "class3" },

    ])


    return (
        <>
            <Header />
            <div className="container">
                <Breadcrum parent="Home" current="Dashboard" />
                <SubMenu />
                <div className="justify-content-between title-line pt-4 dash-navbar">
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
                <Pagination />
            </div>
            <Footer />


        </>
    )
}

export default Dashboardd
