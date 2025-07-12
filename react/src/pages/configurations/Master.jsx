import React, { useState } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import Modal from "../../components/common/Modal";

const Master = () => {
    const breadcrumbItems = [
        { label: 'Configure', href: '#' },
        { label: 'Masters', href: '#' }
    ];

    const [tableHeaders] = useState([
        { label: "# ID", sortable: true },
        { label: "CODE", sortable: true },
        { label: "EQUIPMENT NAME", sortable: true },
        { label: "VARIABLES" },
        { label: "STATUS" },
        { label: "ACTION" },
    ]);

    const [rowData] = useState([
        ["1", "Priority", "PRI", "Active", "Edit"],
        ["2", "Sector", "SEC", "Inactive", "Edit"],
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});

    // ✅ Define the fields specific to Master page
    const fields = [
        {
            label: "Master Name",
            name: "masterName",
            type: "text",
            placeholder: "Enter master name",
            required: true,
        },
        {
            label: "Code",
            name: "code",
            type: "text",
            placeholder: "Enter code",
            required: true,
        }
    ];

    // ✅ Handle input field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: "" }));
    };

    // ✅ Submit handler for modal form
    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = {};
        fields.forEach(field => {
            if (field.required && !formValues[field.name]) {
                errors[field.name] = `${field.label} is required`;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        console.log("Submitted:", formValues); // Replace with actual API call
        setIsModalOpen(false);
        setFormValues({});
    };

    return (
        <>
            <div className="tb-responsive templatebuilder-body">
                <div className="pt-3">
                    <Breadcrumb title="Masters" items={breadcrumbItems} />

                    <Navbar modalTitle="Add Master" modalFields={fields} onAddClick={() => setIsModalOpen(true)} />

                    <Table headers={tableHeaders} rows={rowData} />
                </div>
            </div>

            {/* ✅ Modal with reusable fields and handlers */}
            {isModalOpen && (
                <Modal
                    title="Add Master"
                    fields={fields}
                    values={formValues}
                    errors={formErrors}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default Master;
