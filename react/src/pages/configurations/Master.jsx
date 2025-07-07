import React, { useState } from 'react'
import Breadcrum from '../../components/general/Breadcrum'
import SubMenu from '../../components/common/SubMenu'
import Button from '../../components/common/Button'
import Dropdown from '../../components/common/Dropdown'
import Table from '../../components/common/Table'
import Pagination from '../../components/general/Pagination'
import Search from '../../components/common/Search'
import Modal from '../../components/common/Modal'

function Master() {
    const [showPopup, setShowPopup] = useState(false);
    const [tableHeaders] = useState([
        { label: "# ID", sortable: true },
        { label: "MASTER NAME", sortable: true },
        { label: "DISPLAY NAME SINGULAR", sortable: true },
        { label: "Display NAME PLURAL", sortable: true },
        { label: "TABLE NAME", sortable: true },
        { label: "ACTION" },
    ]);
    const [rowData] = useState([
        " Priority",
        "  Sector",
        "  PRI",
        " Plant 1",
        " PRI",
        " PRI"
    ]);
    const [options] = useState([

        { label: "Asset Class 1", value: "class1" },
        { label: "Asset Class 2", value: "class2" },
        { label: "Asset Class 3", value: "class3" },

    ])

    const dynamicFields = [
        {
            label: "Master Name",
            type: "text",
            name: "masterName",
            placeholder: "Enter master name",
            required: true,
            isNumeric: false,
            maxLength: 50
        },
        {
            label: "Master Description",
            type: "textarea",
            name: "description",
            placeholder: "Enter master description",
            required: false
        }
    ];
    return (
        <>
            <Breadcrum parent="Configuration" current="Master" />
            <div className="justify-content-between title-line pt-4 dash-navbar">
                <div className="d-flex gap-3">
                    <div className="search-container">
                        <img src="/src/assets/icons/search2.svg" alt="" />
                        <input type="text" placeholder="Search for Masters" />
                    </div>

                </div>
                <div className="d-flex gap-3 buttons">
                    <Dropdown
                        label="All"
                        options={[
                            { label: "Active", value: "class1" },
                            { label: "Inactive", value: "class2" },
                        ]}
                        onChange={(e) => console.log("Selected:", e.target.value)}
                    />
                    <div id="overlay" />
                    <div>
                        <Button
                            name="Add Master"
                            icon="plus-icon"
                            onClick={() => setShowPopup(true)}
                        />
                    </div>
                </div>

            </div>
            <Table headers={tableHeaders} rows={rowData} />
            <Pagination />

            {showPopup && (
                <Modal
                    onClose={() => setShowPopup(false)}
                    fields={dynamicFields}
                    title="Add Master"
                />
            )}
        </>
    )
}

export default Master