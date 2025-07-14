import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import axiosWrapper from "../../../services/AxiosWrapper";
import Modal from "../../components/common/Modal";

const RoleGroup = () => {
    const [roles, setRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
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
        setEditModalOpen(true);
    };


    const fetchRoles = async (page = 1, limit = pageSize, sort = sortBy, sortOrder = order) => {
        try {
            setLoading(true);
            const response = await axiosWrapper(
                `api/v1/role-groups/paginateRoleGroups?page=${page}&limit=${limit}&sortBy=${sort}&order=${sortOrder}`,
                { method: 'POST' }
            );
            const mappedRows = response.roleGroups.map((role, index) => ({
                _id: role._id, // Include this line
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
            console.error("Failed to fetch roles:", error.message || error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchRoles(currentPage, pageSize, sortBy, order);
    }, [currentPage, pageSize, sortBy, order]);
    const roleFields = [
        { label: "Role Code", name: "roleCode", type: "text", placeholder: "Enter role code", required: true },
        { label: "Role Name", name: "roleName", type: "text", placeholder: "Enter role name" },
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

            console.log("Created:", res.data);
            onSuccess(); // Close modal
            fetchRoles(); // Refresh the table

        } catch (err) {
            console.error("Error creating role:", err.message);

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

    fetchRoles(); 
  } catch (err) {
    console.error("Failed to toggle role status:", err.message || err);
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
            <div className="tb-responsive templatebuilder-body">
                <div className="pt-3">
                    <Breadcrumb title="Role Group" items={breadcrumbItems} />
                    <Navbar modalTitle="Add Role Group" modalFields={roleFields} onSubmit={handleRoleSubmit} />
                    <Table
                        headers={headers}
                        rows={roles}
                        sortBy={sortBy}
                        order={order}
                        onSortChange={handleSortChange}
                        onEdit={handleEditClick}
                        onToggleStatus={handleToggleStatus}
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
                            title="Edit Role"
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
