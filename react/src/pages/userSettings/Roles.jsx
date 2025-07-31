import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import Modal from "../../components/common/Modal";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../../components/general/LoaderAndSpinner/Loader";

const Role = () => {
    const [roles, setRoles] = useState([]);
    const [roleGroups, setRoleGroups] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("role_code");
    const [order, setOrder] = useState("asc");
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState('');


    const debounceTimeoutRef = useRef(null);
    const breadcrumbItems = [
        { label: "Configure", href: "#" },
        { label: "User Settings", href: "#" },
        { label: "Roles", href: "#" },
    ];

    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Role Group", key: "role_group_name", sortable: false },
        { label: "Role Code", key: "role_code", sortable: true },
        { label: "Role Name", key: "role_name", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    const fetchRoles = async (page = 1, limit = pageSize, sort = sortBy, sortOrder = order, status = statusFilter,
        searchText = search) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);
            params.append("sortBy", sort);
            params.append("order", sortOrder);

            if (status === "active") params.append("status", "true");
            else if (status === "inactive") params.append("status", "false");

            if (searchText?.trim()) params.append("search", searchText.trim());

            const response = await axiosWrapper(
                `api/v1/roles/paginateRoles?${params.toString()}`,
                { method: 'POST' }
            );

            const mappedRows = response.roles.map((role, index) => {
                return {
                    _id: role._id,
                    index: index + 1 + (page - 1) * pageSize,
                    role_group_id: role.role_group_id,
                    role_group_name: role?.role_group?.role_group_name || "N/A", // 🟢 ADD THIS
                    role_code: role.role_code,
                    role_name: role.role_name,
                    status: role.status,
                };
            });


            setRoles(mappedRows);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            // console.error("Failed to fetch roles:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleGroups = async () => {
        try {
            const response = await axiosWrapper("api/v1/role-groups/getRoleGroups", {
                method: "POST",
            });
            setRoleGroups(response.role_groups);
            fetchRoles(currentPage, pageSize, sortBy, order, response.roleGroups);
        } catch (error) {
            // console.error("Failed to fetch role groups:", error.message || error);
        }
    };

    useEffect(() => {
        fetchRoleGroups();
    }, []);

    useEffect(() => {
        if (roleGroups && roleGroups?.length) {
            fetchRoles(currentPage, pageSize, sortBy, order, statusFilter, search);
        }
    }, [roleGroups, currentPage, pageSize, sortBy, order, statusFilter]);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);

        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            fetchRoles(1, pageSize, sortBy, order, statusFilter, val);
        }, 500);
    };
    const roleFields = [
        {
            label: "Role Code",
            name: "role_code",
            type: "text",
            placeholder: "Enter role code",
            required: true,
        },
        {
            label: "Role Name",
            name: "role_name",
            type: "text",
            placeholder: "Enter role name",
            required: true,
        },
        {
            label: "Role Group",
            name: "role_group_id",
            type: "dropdown",
            required: true,
            options: roleGroups?.map(group => ({
                label: group.role_group_name,
                value: group._id,
            })),
        },
    ];

    const handleRoleSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);
            const payload = {
                role_group_id: formData.role_group_id,
                role_code: formData.role_code,
                role_name: formData.role_name,
            };

            await axiosWrapper("api/v1/roles/createRole", {
                method: "POST",
                data: payload,
            });

            onSuccess();
            fetchRoles();

        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors({
                    role_group_id: apiErrors.role_group_id,
                    role_code: apiErrors.role_code,
                    role_name: apiErrors.role_name,
                });
            } else {
                setErrors({ role_name: "Unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (row) => {
        setEditErrors({});
        setEditFormData({
            id: row._id,
            role_group_id: row.role_group_id,
            role_code: row.role_code,
            role_name: row.role_name,
            status: row.status,
        });
        setEditModalOpen(true);
    };

    const handleUpdateSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);

            const payload = {
                id: formData.id, // 👈 pass ID in body instead of params
                role_group_id: formData.role_group_id,
                role_code: formData.role_code,
                role_name: formData.role_name,
                status: formData.status ?? true,
            };

            await axiosWrapper("api/v1/roles/updateRole", {
                method: "POST",
                data: payload
            });

            onSuccess(); // Close modal
            fetchRoles(currentPage, pageSize, sortBy, order, statusFilter);

            setEditModalOpen(false);
        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors({
                    role_group_id: apiErrors.role_group_id,
                    role_code: apiErrors.role_code,
                    role_name: apiErrors.role_name,
                });
            } else {
                setErrors({ role_name: "Unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };


    const handleToggleStatus = async (row) => {
        try {
            setLoading(true);

            await axiosWrapper("api/v1/roles/deleteRole", {
                method: "POST",
                data: { id: row._id },
            });
            fetchRoles(currentPage, pageSize, sortBy, order, statusFilter);

        } catch (err) {
            // console.error("Failed to toggle role status:", err.message || err);
            alert(err?.message?.message);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteRole = async (row) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this role permanently?");
        if (!confirmDelete) return;

        try {
            setLoading(true);
            const response = await axiosWrapper("api/v1/roles/destroyRole", {
                method: "POST",
                data: { id: row._id },
            });

            if (response?.message) {
                alert(response.message);
            }
            fetchRoles();
        } catch (error) {
            // console.error("Failed to delete role permanently:", error.message || error);
            alert(error?.message?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1);
    };

    return (
        <div className="tb-responsive templatebuilder-body position-relative">
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                <Breadcrumb title="Roles" items={breadcrumbItems} />
                <Navbar
                    modalTitle="Add Role"
                    modalFields={roleFields}
                    onSubmit={handleRoleSubmit}
                    onFilterChange={(val) => {
                        setStatusFilter(val);
                        setCurrentPage(1);
                    }}
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                />
                <Table
                    headers={headers}
                    rows={roles}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onEdit={handleEditClick}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteRole}
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
                {editModalOpen && (
                    <Modal
                        title="Edit Role"
                        fields={roleFields}
                        values={editFormData}
                        errors={editErrors}
                        loading={loading}
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
                        submitButtonLabel="UPDATE"
                    />
                )}
            </div>
        </div>
    );
};

export default Role;
