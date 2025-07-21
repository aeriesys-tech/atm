import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Table from "../../components/common/Table";
import Breadcrumb from "../../components/general/Breadcrum";
import Navbar from "../../components/general/Navbar";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import Search from "../../components/common/Search";
import search2 from "../../assets/icons/search2.svg";
import Modal from "../../components/common/Modal";

const MasterDetail = () => {
    const { masterId } = useParams();

    const [data, setData] = useState([]);
    const [master, setMaster] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sortBy, setSortBy] = useState("created_at");
    const [order, setOrder] = useState("asc");
    const [showModal, setShowModal] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? Number(value) : value;
        setFormValues(prev => ({ ...prev, [name]: parsedValue }));
    };

    const fetchMasterData = async () => {
        try {
            setLoading(true);

            console.log("Calling API with masterId:", masterId);

            const response = await axiosWrapper(
                `api/v1/masters/dynamic-data/paginate?page=${currentPage}&limit=${pageSize}&sortBy=${sortBy}&order=${order}`,
                {
                    method: "POST",
                    data: { masterId },
                }
            );
            console.log(response)
            const { master, data: dataRows, currentPage: resPage, totalPages } = response.data;
            setMaster(response);
            setData(response.data);
            setCurrentPage(resPage);
            setTotalItems(response?.data?.length);
            setTotalPages(Math.ceil(totalItems / pageSize));
        } catch (error) {
            console.error("Error fetching master detail:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = [
        { label: "Configure", href: "#" },
        { label: master?.master?.parameter_type_id?.parameter_type_name || "Masters", href: "#" },
        { label: master?.master?.master_name || "Master", href: "#" },
    ];
    useEffect(() => {
        if (masterId) {
            fetchMasterData();
        }
    }, [masterId, currentPage, pageSize, sortBy, order]);

    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1);
    };
    const allKeys = Array.from(
        new Set(data.flatMap(obj => Object.keys(obj)))
    ).filter(
        key => !["_id", "__v", "created_at", "updated_at", "deleted_at", "docId", "masterId", "index"].includes(key)
    );
    const nonStatusKeys = allKeys.filter(key => key !== "status");
    const hasStatus = allKeys.includes("status");
    const processedData = data.map((row, index) => {
        const filledRow = {
            index: index + 1,
            _id: row._id // ✅ Add this line
        };

        [...nonStatusKeys, ...(hasStatus ? ["status"] : [])].forEach(key => {
            filledRow[key] = row[key] !== undefined ? row[key] : "---";
        });

        return filledRow;
    });




    const headers = data?.length > 0
        ? [
            { label: "ID", key: "index", sortable: false },
            ...nonStatusKeys.map(key => ({
                label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                key,
                sortable: false,
            })),
            ...(hasStatus
                ? [{
                    label: "Status",
                    key: "status",
                    sortable: false,
                }]
                : []),
            { label: "Actions", key: "action", sortable: false },
        ]
        : [];
    const handleAddMasterEntry = async (formValues, setErrors, onSuccess) => {
        try {
            const payload = {
                id: masterId,           // required by backend as `id`
                ...formValues,          // dynamic fields like name, code, etc.
            };

            const res = await axiosWrapper("api/v1/masters/masters/add", {
                method: "POST",
                data: payload,
            });

            // Success: refetch table & close modal
            fetchMasterData();
            onSuccess();
        } catch (error) {
            console.error("Error creating master entry:", error?.message?.message);
            alert(error?.message?.message);
            if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);  // This will map to form field error messages
            }
        }
    };
    const handleDeleteDynamicField = async (row) => {
        try {
            setLoading(true);

            await axiosWrapper("api/v1/masters/masterfields-delete", {
                method: "POST",
                data: {
                    masterId: masterId,
                    docId: row._id
                }
            });

            fetchMasterData(currentPage, pageSize);


        } catch (error) {
            console.error("Failed to soft delete dynamic field:", error.message || error);
        } finally {
            setLoading(false);
        }
    };
    const handleEditClick = (row) => {
        setEditErrors({});
        setEditFormData(row);
        setEditModalOpen(true);
    };
    const handleUpdateSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);

            const payload = {
                masterId: masterId, // Master ID
                docId: formData._id, // Document ID to update
                ...formData,
            };

            await axiosWrapper("api/v1/masters/masters-update", {
                method: "POST",
                data: payload,
            });

            onSuccess();
            fetchMasterData(); // Refresh the table
            setEditModalOpen(false);
        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors(apiErrors);
            } else {
                setErrors({ general: "Unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };
const handleHardDeleteDynamicField = async (row) => {
    if (!window.confirm("Are you sure you want to permanently delete this record?")) return;

    try {
        setLoading(true);
        await axiosWrapper("api/v1/masters/masters/destroy", {
            method: "POST",
            data: {
                masterId: masterId,
                docId: row._id
            },
        });
    if (!window.confirm("Permanently deleted this record.")) return;

        await fetchMasterData(); 
    } catch (error) {
        console.error("Hard delete failed:", error.message || error);
        alert("Failed to permanently delete. Check dependencies or server logs.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="tb-responsive templatebuilder-body position-relative">
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                <Breadcrumb title="Dynamic Master Details" items={breadcrumbItems} />
                {/* <h4 className="py-3">Master Detail: {master?.master_name || ""}</h4> */}
                <div className="navbar-3 mt-0 d-flex justify-content-between">
                    <div className="d-flex gap-4">
                        <div className="search-container">
                            <img src={search2} alt="Search" />
                            <Search />
                        </div>
                    </div>

                    <div className="d-flex gap-3">
                        {/* <Dropdown
                            label="All"
                            options={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" }
                            ]}
                            onChange={(e) => console.log("Selected:", e.target.value)}
                        /> */}

                        <Button name={`Add ${master?.master?.master_name || 'Master'}`} onClick={() => setShowModal(true)} />
                        {showModal && (
                            <Modal
                                title={`Add ${master?.master?.master_name || 'Master'}`}
                                onClose={() => setShowModal(false)}
                                onSubmit={handleAddMasterEntry}
                                fields={
                                    master?.master?.masterFields?.map(field => ({
                                        label: field.display_name,
                                        name: field.field_name,
                                        type: field.field_type.toLowerCase() === "number" ? "number" : "text",
                                        required: field.required,
                                    })) || []
                                }
                                values={formValues}
                                setValues={setFormValues}
                                errors={formErrors}
                                setErrors={setFormErrors}
                                onChange={handleInputChange}
                                onSuccess={() => {
                                    setShowModal(false);
                                    setFormValues({});
                                    setFormErrors({});
                                }}
                            />
                        )}

                    </div>
                </div>

                <Table
                    headers={headers}
                    rows={processedData}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onToggleStatus={handleDeleteDynamicField}
                    onEdit={handleEditClick}
                    onDelete={handleHardDeleteDynamicField}
                    paginationProps={{
                        currentPage,
                        totalPages,
                        pageSize,
                        totalItems,
                        onPageChange: setCurrentPage,
                        onPageSizeChange: size => {
                            setPageSize(size);
                            setCurrentPage(1);
                        },
                    }}
                />
                {editModalOpen && (
                    <Modal
                        title={`Edit ${master?.master?.master_name || 'Entry'}`}
                        fields={master?.master?.masterFields?.map(field => ({
                            label: field.display_name,
                            name: field.field_name,
                            type: field.field_type.toLowerCase() === "number" ? "number" : "text",
                            required: field.required,
                        })) || []}
                        values={editFormData}
                        errors={editErrors}
                        onChange={(e) => {
                            const { name, value } = e.target;
                            setEditFormData((prev) => ({ ...prev, [name]: value }));
                        }}
                        onSubmit={() =>
                            handleUpdateSubmit(editFormData, setEditErrors, () => {
                                setEditModalOpen(false);
                            })
                        }
                        onClose={() => setEditModalOpen(false)}
                        submitButtonLabel="Update"
                        loading={loading}
                    />
                )}

            </div>
        </div>
    );
};

export default MasterDetail;