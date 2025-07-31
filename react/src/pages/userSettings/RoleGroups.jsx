import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import axiosWrapper from "../../../services/AxiosWrapper";
import Modal from "../../components/common/Modal";
import Loader from "../../components/general/LoaderAndSpinner/Loader";

const RoleGroup = () => {
    const [roles, setRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("role_group_code");
    const [order, setOrder] = useState("asc");
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState({});
    const [addErrors, setAddErrors] = useState({});
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState('');


    const debounceTimeoutRef = useRef(null);
    const breadcrumbItems = [
        { label: 'Configure', href: '#' },
        { label: 'User Settings', href: '#' },
        { label: 'Role Groups', href: '#' }
    ];
    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Role Group Code", key: "role_group_code", sortable: true },
        { label: "Role Group Name", key: "role_group_name", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    const handleEditClick = (rowData) => {
        setEditFormData({
            id: rowData._id, // Ensure _id is returned from API
            roleCode: rowData.role_group_code,
            roleName: rowData.role_group_name,
            status: rowData.status,
        });
        setEditErrors({});
        setEditModalOpen(true);
    };


    const fetchRoles = async (
        page = 1,
        limit = pageSize,
        sort = sortBy,
        sortOrder = order,
        status = statusFilter,
        searchText = search
    ) => {
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
                `api/v1/role-groups/paginateRoleGroups?${params.toString()}`,
                { method: "POST" }
            );

            const mappedRows = response.roleGroups.map((role, index) => ({
                _id: role._id,
                index: index + 1,
                role_group_code: role.role_group_code,
                role_group_name: role.role_group_name,
                status: role.status,
            }));

            setRoles(mappedRows);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            // console.error("Error fetching roles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles(currentPage, pageSize, sortBy, order, statusFilter, search);
    }, [currentPage, pageSize, sortBy, order, statusFilter]);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);

        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            fetchRoles(1, pageSize, sortBy, order, statusFilter, val);
        }, 500);
    };
    const roleFields = [
        { label: "Role Group Code", name: "roleCode", type: "text", placeholder: "Enter role code", required: true },
        { label: "Role Group Name", name: "roleName", type: "text", placeholder: "Enter role name" },
    ];

    const handleRoleSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);
            const payload = {
                role_group_code: formData.roleCode,
                role_group_name: formData.roleName
            };

            const res = await axiosWrapper('api/v1/role-groups/createRoleGroup', {
                method: 'POST',
                data: payload
            });

            onSuccess();
            fetchRoles();

        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors({
                    roleCode: apiErrors.role_group_code,
                    roleName: apiErrors.role_group_name
                });
            } else {
                setErrors({ roleName: "An unexpected error occurred." });
            }
            alert(err?.message?.message);
        } finally {
            setLoading(false);
        }
    };
    const handleUpdateSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);
            const payload = {
                id: editFormData.id,
                role_group_code: formData.roleCode,
                role_group_name: formData.roleName,
                status: formData.status ?? true,
            };

            const res = await axiosWrapper('api/v1/role-groups/updateRoleGroup', {
                method: 'POST',
                data: payload
            });

            onSuccess();
            fetchRoles(); // Refresh table
            setEditModalOpen(false);
        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors({
                    roleCode: apiErrors.role_group_code,
                    roleName: apiErrors.role_group_name
                });
            } else {
                setErrors({ roleName: "An unexpected error occurred." });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (row) => {
        try {
            setLoading(true);

            await axiosWrapper('api/v1/role-groups/deleteRoleGroup', {
                method: 'POST',
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
    const handleDeleteRoleGroup = async (row) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this role group permanently?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            const response = await axiosWrapper("api/v1/role-groups/destroyRoleGroup", {
                method: "POST",
                data: { id: row._id },
            });

            if (response?.message) {
                alert(response.message);
            }
            fetchRoles();
        } catch (error) {
            // console.error("Failed to delete role group permanently:", error.message || error);
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
    // if (loading) return <Loader />;
    return (
        <>
            <div className="tb-responsive templatebuilder-body position-relative">
                {loading && (
                    <div className="loader-overlay d-flex justify-content-center align-items-center">
                        <Loader />
                    </div>
                )}
                <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                    <Breadcrumb title="Role Group" items={breadcrumbItems} />
                    <Navbar modalTitle="Add Role Group" modalFields={roleFields} onSubmit={handleRoleSubmit} onFilterChange={(val) => {
                        setStatusFilter(val);
                        setCurrentPage(1);
                    }}
                        searchValue={search}
                        onSearchChange={handleSearchChange} />
                    <Table
                        headers={headers}
                        rows={roles}
                        sortBy={sortBy}
                        order={order}
                        onSortChange={handleSortChange}
                        onEdit={handleEditClick}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDeleteRoleGroup}
                        paginationProps={{
                            currentPage,
                            totalPages,
                            pageSize,
                            totalItems,
                            onPageChange: setCurrentPage,
                            onPageSizeChange: (size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                            }
                        }}
                    />
                    {editModalOpen && (
                        <Modal
                            title="Edit Role Group"
                            fields={roleFields}
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
                            submitButtonLabel="UPDATE"
                        />
                    )}

                </div>
            </div>
        </>
    );
};

export default RoleGroup;
