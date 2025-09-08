import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import Modal from "../../components/common/Modal";
import axiosWrapper from "../../../services/AxiosWrapper";
import search2 from "../../assets/icons/search2.svg";
import Search from "../../components/common/Search";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import deleteicon from '../../../src/assets/icons/trash.svg';

const Master = () => {
    const breadcrumbItems = [
        { label: 'Configure', href: '#' },
        { label: 'Masters', href: '#' }
    ];

    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Master Name", key: "master_name", sortable: true },
        { label: "Display Name Singular", key: "display_name_singular", sortable: true },
        { label: "Display Name Plural", key: "display_name_plural", sortable: true },
        { label: "Table Name", key: "model_name", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("master_name");
    const [order, setOrder] = useState("asc");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [masterFieldErrors, setMasterFieldErrors] = useState({});

    const [loading, setLoading] = useState(false);
    const [parameterTypeOptions, setParameterTypeOptions] = useState([]);
    const [masterFieldValues, setMasterFieldValues] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMasterId, setEditingMasterId] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState('');
    const [modelNameManuallyEdited, setModelNameManuallyEdited] = useState(false);

    const debounceTimeoutRef = useRef(null);
    const masterFields = [
        { label: "Master Name", name: "master_name", type: "text", required: true },
        { label: "Table Name", name: "model_name", type: "text", required: true },
        { label: "Display Name (Singular)", name: "display_name_singular", type: "text", required: true },
        { label: "Display Name (Plural)", name: "display_name_plural", type: "text", required: true },
        { label: "Order", name: "order", type: "number", required: true },
        { label: "Parameter Type", name: "parameter_type_id", type: "dropdown", options: parameterTypeOptions, required: true, },
    ];
    const [masterFieldData, setMasterFieldData] = useState([
        {
            field_type: "",
            field_name: "",
            display_name: "",
            order: 1,
            tooltip: "",
            required: false,
            default: false,
            is_unique: false,

        },
    ]);
    const handleAddField = () => {
        setMasterFieldData((prev) => [
            ...prev,
            {
                field_type: "",
                field_name: "",
                display_name: "",
                order: 1,
                tooltip: "",
                required: false,
                default: false,
                is_unique: false,
            },
        ]);
    };

    const handleRemoveField = (index) => {
        setMasterFieldData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFieldChange = (e, index) => {
        const { name, value } = e.target;

        setMasterFieldData((prev) =>
            prev.map((field, i) => {
                if (i !== index) return field;

                let updatedField = {
                    ...field,
                    [name]:
                        name === "required" || name === "default" || name === "is_unique"
                            ? value === "true" || value === true
                            : value,
                };

                // ✅ Auto-generate field_name when display_name changes
                if (name === "display_name") {
                    updatedField.field_name = value
                        .trim()
                        .replace(/\s+/g, "_")
                        .toLowerCase();
                }

                if (name === "default") {
                    if (value === "true") {
                        updatedField.required = true;
                        updatedField.is_unique = true;
                    } else {
                        updatedField.required = false;
                        updatedField.is_unique = false;
                    }
                }

                return updatedField;
            })
        );
    };




    const fetchMasters = async (page = 1, limit = pageSize, sort = sortBy, sortOrder = order, silent = false, status = statusFilter,
        searchText = search) => {
        try {
            if (!silent) setLoading(true);
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);
            params.append("sortBy", sort);
            params.append("order", sortOrder);

            if (status === "active") params.append("status", "true");
            else if (status === "inactive") params.append("status", "false");

            if (searchText?.trim()) params.append("search", searchText.trim());

            const response = await axiosWrapper(
                `api/v1/masters/paginateMasters?${params.toString()}`,
                { method: "POST" }
            );

            const mapped = response.masters.map((item, index) => ({
                _id: item._id,
                index: (page - 1) * limit + index + 1,
                master_name: item.master_name,
                display_name_singular: item.display_name_singular,
                display_name_plural: item.display_name_plural,
                model_name: item.model_name,
                status: item.status,
                parameter_type_id: item.parameter_type_id,
                order: item.order,
                masterFields: item.masterFields || [],
                action: "Edit"
            }));

            setRows(mapped);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            fetchParameterTypes();
        } catch (error) {
            // console.error("Failed to fetch masters:", error.message || error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasters(currentPage, pageSize, sortBy, order, false, statusFilter, search);
    }, [currentPage, pageSize, sortBy, order, statusFilter]);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);

        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            fetchMasters(1, pageSize, sortBy, order, false, statusFilter, val);
        }, 500);
    };
    const fetchParameterTypes = async () => {
        try {
            const res = await axiosWrapper("api/v1/parameter-types/getParameterTypes", {
                method: "POST"
            });
            const formatted = res.map(item => ({
                label: item.parameter_type_name,
                value: item._id
            }));
            setParameterTypeOptions(formatted);
        } catch (err) {
            // console.error("Failed to fetch parameter types", err.message || err);
        }
    };
    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1);
    };

    const sanitizeModelName = (str) => {
        return str
            .trim()
            .toLowerCase()
            .replace(/_/g, "")
            .replace(/\s+/g, "_")         // replace spaces with underscore
            .replace(/[^a-z0-9_]/g, ""); // remove all except a-z, 0-9, underscore

    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormValues((prev) => {
            if (name === "master_name") {
                const derivedModelName = sanitizeModelName(value);

                return {
                    ...prev,
                    master_name: value, // keep original input as is
                    model_name: modelNameManuallyEdited ? prev.model_name : derivedModelName,
                };
            }

            if (name === "model_name") {
                // sanitize user input live to allow only valid chars
                const sanitizedValue = sanitizeModelName(value);
                setModelNameManuallyEdited(true);
                return {
                    ...prev,
                    model_name: sanitizedValue,
                };
            }

            // other fields
            return {
                ...prev,
                [name]: value,
            };
        });

        setFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleEditMaster = (row) => {
        const selectedMaster = rows.find((item) => item._id === row._id);

        if (!selectedMaster) return;
        setFormErrors({});
        setMasterFieldErrors({});
        setModelNameManuallyEdited(false);
        // Populate form values
        setFormValues({
            master_name: selectedMaster.master_name,
            display_name_singular: selectedMaster.display_name_singular,
            display_name_plural: selectedMaster.display_name_plural,
            model_name: selectedMaster.model_name,
            order: selectedMaster.order,
            parameter_type_id: selectedMaster.parameter_type_id,
        });

        setMasterFieldData(
            (selectedMaster.masterFields || []).map((field) => ({
                field_type: field.field_type,
                field_name: field.field_name,
                display_name: field.display_name,
                order: field.order,
                tooltip: field.tooltip,
                required: Boolean(field.required),
                default: Boolean(field.default),
                is_unique: Boolean(field.is_unique),
            }))
        );

        setIsEditMode(true);
        setEditingMasterId(selectedMaster._id);
        setIsModalOpen(true);
    };

    const handleCreateOrUpdateMaster = async (formData, setErrors, onSuccess) => {
        try {
            setModalLoading(true);

            const payload = {
                masterData: {
                    master_name: formData.master_name,
                    display_name_singular: formData.display_name_singular,
                    display_name_plural: formData.display_name_plural,
                    model_name: formData.model_name,
                    parameter_type_id: formData.parameter_type_id,
                    order: isNaN(Number(formData.order)) ? 1 : Number(formData.order),
                },
                masterFieldData: masterFieldData.map((item) => ({
                    ...item,
                    order: isNaN(Number(item.order)) ? 1 : Number(item.order),
                    required: Boolean(item.required),
                    default: Boolean(item.default),
                    is_unique: Boolean(item.is_unique),
                })),
            };

            let createdMaster = null;

            if (isEditMode) {
                payload.id = editingMasterId;
                await axiosWrapper("api/v1/masters/updateMaster", {
                    method: "POST",
                    data: payload,
                });
            } else {
                const res = await axiosWrapper("api/v1/masters/createMaster", {
                    method: "POST",
                    data: payload,
                });
                createdMaster = res?.master || res?.data?.master; // adjust based on API format
            }

            // ✅ Update sessionStorage only on create
            if (!isEditMode && createdMaster) {
                const sessionData = JSON.parse(sessionStorage.getItem("parameterTypes"));
                if (sessionData && Array.isArray(sessionData)) {
                    const updatedSessionData = sessionData.map((item) => {
                        if (item._id === payload.masterData.parameter_type_id) {
                            return {
                                ...item,
                                masterDetails: [
                                    ...(item.masterDetails || []),
                                    {
                                        masterId: createdMaster._id,
                                        masterName: createdMaster.master_name,
                                        order: createdMaster.order,
                                    },
                                ],
                            };
                        }
                        return item;
                    });
                    sessionStorage.setItem("parameterTypes", JSON.stringify(updatedSessionData));
                }
            }

            onSuccess();
            await fetchMasters();
        } catch (err) {
            const apiErrors = err?.response?.data?.errors || {};
            const masterErrors = {};
            const fieldErrors = [];

            for (const key in apiErrors) {
                if (key.startsWith("masterData.")) {
                    const field = key.split("masterData.")[1];
                    masterErrors[field] = apiErrors[key];
                } else if (key.startsWith("masterFieldData[")) {
                    const match = key.match(/masterFieldData\[(\d+)\]\.(.+)/);
                    if (match) {
                        const index = parseInt(match[1], 10);
                        const field = match[2];
                        fieldErrors[index] = fieldErrors[index] || {};
                        fieldErrors[index][field] = apiErrors[key];
                    }
                }
            }

            setFormErrors(masterErrors);
            setMasterFieldErrors(fieldErrors);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSoftDelete = async (row) => {
        try {
            setLoading(true);
            await axiosWrapper(`api/v1/masters/deleteMaster`, {
                method: "POST",
                data: { id: row._id },
            });
            fetchMasters(currentPage, pageSize, sortBy, order, statusFilter);
        } catch (error) {
            // console.error("Soft delete failed:", error.message || error);
        } finally {
            setLoading(false);
        }
    };
    const handleHardDelete = async (row) => {
        if (!window.confirm("Are you sure you want to permanently delete this master?")) return;

        try {
            setLoading(true);

            // Delete from server
            await axiosWrapper(`api/v1/masters/destroyMaster`, {
                method: "POST",
                data: { id: row._id },
            });

            // Step 1: Get sessionStorage array
            const sessionData = JSON.parse(sessionStorage.getItem("parameterTypes"));
            if (sessionData && Array.isArray(sessionData)) {
                const updatedData = sessionData.map((item) => {
                    if (Array.isArray(item.masterDetails)) {
                        return {
                            ...item,
                            masterDetails: item.masterDetails.filter(
                                (detail) => detail.masterId !== row._id
                            ),
                        };
                    }
                    return item;
                });

                sessionStorage.setItem("parameterTypes", JSON.stringify(updatedData));
            }

            await fetchMasters(currentPage, pageSize, sortBy, order);
        } catch (error) {
            // console.error("Hard delete failed:", error.message || error);
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
                <Breadcrumb title="Masters" items={breadcrumbItems} />
                {/* <Navbar
                    modalTitle="Add Master"
                  modalFields={masterFields}
                    onSubmit={handleCreateMaster}
                /> */}
                <div className="navbar-3 mt-0 d-flex justify-content-between">
                    <div className="d-flex gap-4">
                        <div className="search-container">
                            <img src={search2} alt="Search" />
                            <Search value={search} onChange={handleSearchChange} />
                        </div>
                    </div>

                    <div className="d-flex gap-3">
                        <Dropdown
                            label="All"
                            options={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" }
                            ]}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}

                        />

                        <Button name="Add Master" onClick={() => {
                            setIsEditMode(false);
                            setEditingMasterId(null);
                            setFormValues({});
                            setFormErrors({});
                            setMasterFieldErrors({});
                            setMasterFieldData([
                                {
                                    field_type: "",
                                    field_name: "",
                                    display_name: "",
                                    order: 1,
                                    tooltip: "",
                                    required: false,
                                    default: false,
                                    is_unique: false,
                                },
                            ]);
                            setIsModalOpen(true);
                        }} />
                    </div>
                </div>
                <Table
                    headers={headers}
                    rows={rows}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onEdit={handleEditMaster}
                    onToggleStatus={handleSoftDelete}
                    onDelete={handleHardDelete}
                    paginationProps={{
                        currentPage,
                        totalPages,
                        pageSize,
                        totalItems,
                        onPageChange: setCurrentPage,
                        onPageSizeChange: (size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        },
                    }}
                />
            </div>

            {isModalOpen && (
                <div className="modal-overlay2" onClick={() => setIsModalOpen(false)} >
                    <div className="addunit-card1 " onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
                        {modalLoading && (
                            <div className="loader-overlay d-flex justify-content-center align-items-center">
                                <Loader />
                            </div>
                        )}
                        <div className="addunit-header d-flex justify-content-between align-items-center p-3">
                            <h4>{isEditMode ? "Update Master" : "Add Master"}</h4>
                            <a onClick={() => setIsModalOpen(false)} style={{ cursor: "pointer" }}>
                                <img src="src/assets/icons/close.svg" width="28px" height="28px" alt="Close" />
                            </a>
                            {/* <button onClick={() => setIsModalOpen(false)} className="btn-close" /> */}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateOrUpdateMaster(
                                    { ...formValues, ...masterFieldValues },
                                    setFormErrors,
                                    () => {
                                        setIsModalOpen(false);
                                        setFormValues({});
                                        setFormErrors({});
                                        setMasterFieldErrors({});
                                        setIsEditMode(false);
                                        setEditingMasterId(null);
                                        setModelNameManuallyEdited(false);
                                        setMasterFieldData([
                                            {
                                                field_type: "",
                                                field_name: "",
                                                display_name: "",
                                                order: 1,
                                                tooltip: "",
                                                required: false,
                                                default: false,
                                                is_unique: false,
                                            },
                                        ]);
                                    }
                                );
                            }}
                        >
                            <div className="addunit-form p-4 mb-3" >
                                <div className="row">
                                    {masterFields.map((field, index) => {
                                        if (isEditMode && field.name === "model_name") {
                                            return null;
                                        }

                                        return (
                                            <div className="col-md-6" key={index}>
                                                {field.type === "dropdown" ? (
                                                    <Dropdown
                                                        label={field.label}
                                                        options={field.options || []}
                                                        name={field.name}
                                                        value={formValues[field.name] ?? ""}
                                                        onChange={handleInputChange}
                                                        error={formErrors[field.name]}
                                                    />
                                                ) : (
                                                    <InputField
                                                        label={field.label}
                                                        type={field.type}
                                                        name={field.name}
                                                        isRequired={true}
                                                        value={formValues[field.name] ?? ""}
                                                        onChange={handleInputChange}
                                                        placeholder={field.placeholder}
                                                        error={formErrors[field.name]}
                                                        isNumeric={field.name === "order"}
                                                        step="1"
                                                        min="0"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}


                                    <div className=" d-flex justify-content-between align-items-center mb-3 mt-3">
                                        <h6 className="m-0">Master Fields</h6>
                                        <Button
                                            name="+ Add Field"
                                            onClick={handleAddField}
                                            className="add-field-btn"
                                        />
                                    </div>
                                    <div className="asset-table">
                                        <div className="table-responsive " style={{ overflowX: "auto" }}>
                                            <table className="table table-bordered table-striped align-middle table-text">
                                                <thead className="table-head align-middle">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Field Type</th>
                                                        <th>Display Name</th>
                                                        <th>Field Name</th>
                                                        <th>Order</th>
                                                        <th>Default</th>
                                                        <th>Required</th>
                                                        <th>Unique</th>
                                                        <th>Tooltip</th>
                                                        {masterFieldData.length > 1 && (
                                                            <th>Action</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {masterFieldData.map((field, index) => (
                                                        <tr key={index}>
                                                            <td >{index + 1}</td>

                                                            <td className="pt-0 pb-4">
                                                                <Dropdown
                                                                    name="field_type"
                                                                    options={[
                                                                        { label: "String", value: "String" },
                                                                        { label: "Number", value: "Number" },
                                                                        { label: "Date", value: "Date" },
                                                                    ]}
                                                                    value={field.field_type || ""}
                                                                    onChange={(e) => handleFieldChange(e, index)}
                                                                    error={masterFieldErrors[index]?.field_type}
                                                                />
                                                            </td>

                                                            <td>
                                                                <InputField
                                                                    name="display_name"
                                                                    value={field.display_name || ""}
                                                                    onChange={(e) => handleFieldChange(e, index)}
                                                                    error={masterFieldErrors[index]?.display_name}
                                                                />
                                                            </td>
                                                            <td>
                                                                <InputField
                                                                    name="field_name"
                                                                    value={field.field_name || ""}
                                                                    onChange={(e) => handleFieldChange(e, index)}
                                                                    error={masterFieldErrors[index]?.field_name}
                                                                    disabled
                                                                />
                                                            </td>


                                                            <td>
                                                                <InputField
                                                                    type="number"
                                                                    name="order"
                                                                    value={field.order !== undefined && field.order !== null ? field.order : ""}
                                                                    onChange={(e) => handleFieldChange(e, index)}
                                                                    error={masterFieldErrors[index]?.order}
                                                                    step="1"
                                                                    min="0"
                                                                />
                                                            </td>

                                                            <td className="table-check ">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={String(field.default) === "true"}
                                                                    onChange={() => {
                                                                        handleFieldChange(
                                                                            {
                                                                                target: {
                                                                                    name: "default",
                                                                                    value: String(!(field.default === true || field.default === "true")),
                                                                                },
                                                                            },
                                                                            index
                                                                        );
                                                                    }}
                                                                />
                                                            </td>

                                                            <td className="table-check ">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={String(field.required) === "true"}
                                                                    disabled={String(field.default) === "true"}
                                                                    onChange={() => {
                                                                        handleFieldChange(
                                                                            {
                                                                                target: {
                                                                                    name: "required",
                                                                                    value: String(!(field.required === true || field.required === "true")),
                                                                                },
                                                                            },
                                                                            index
                                                                        );
                                                                    }}
                                                                />
                                                            </td>

                                                            <td className="table-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={String(field.is_unique) === "true"}
                                                                    disabled={String(field.default) === "true"}
                                                                    onChange={() => {
                                                                        handleFieldChange(
                                                                            {
                                                                                target: {
                                                                                    name: "is_unique",
                                                                                    value: String(!(field.is_unique === true || field.is_unique === "true")),
                                                                                },
                                                                            },
                                                                            index
                                                                        );
                                                                    }}
                                                                />
                                                            </td>


                                                            <td>
                                                                <InputField
                                                                    name="tooltip"
                                                                    value={field.tooltip || ""}
                                                                    onChange={(e) => handleFieldChange(e, index)}
                                                                    error={masterFieldErrors[index]?.tooltip}
                                                                />
                                                            </td>
                                                            {masterFieldData.length > 1 && (
                                                                <td>

                                                                    <button
                                                                        type="button"
                                                                        className="btn mt-3 "
                                                                        onClick={() => handleRemoveField(index)}
                                                                    >
                                                                        <img src={deleteicon} alt="Delete" />
                                                                    </button>

                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div className="addunit-card-footer d-flex gap-2 justify-content-center p-3">
                                <Button name="DISCARD" className="discard-btn" onClick={() => setIsModalOpen(false)} />
                                <Button name={isEditMode ? "UPDATE" : "ADD"} type="submit" className="update-btn" />

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Master;
