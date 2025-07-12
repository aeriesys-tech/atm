import React, { useState } from 'react';
import search2 from "../../../src/assets/icons/search2.svg";
import Button from '../common/Button';
import Search from '../common/Search';
import Dropdown from '../common/Dropdown';
import Modal from '../common/Modal'

function Navbar({ modalTitle = "Add Master", modalFields = [], onSubmit }) {
    const [showModal, setShowModal] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (onSubmit) {
            onSubmit(formValues, setFormErrors, () => {
                setShowModal(false); // close modal on success
                setFormValues({});
                setFormErrors({});
            });
        }
    };

    return (
        <>
            <div className="navbar-3 mt-0 d-flex justify-content-between">
                <div className="d-flex gap-4">
                    <div className="search-container">
                        <img src={search2} />
                        <Search />
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <Dropdown
                        label="All"
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" }
                        ]}
                        onChange={(e) => console.log("Selected:", e.target.value)}
                    />

                    <Button name={modalTitle} onClick={() => setShowModal(true)} />
                </div>
            </div>

            {showModal && (
                <Modal
                    title={modalTitle}
                    fields={modalFields}
                    onChange={handleInputChange}
                    values={formValues}
                    errors={formErrors}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </>
    );
}

export default Navbar;
