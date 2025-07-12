import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import axiosWrapper from "../../../services/AxiosWrapper";

const Role = () => {
    const [roles, setRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [sortBy, setSortBy] = useState("role_group_code");
    const [order, setOrder] = useState("asc");
     const [loading, setLoading] = useState(false);
    const breadcrumbItems = [
        { label: 'Configure', href: '#' },
        { label: 'User Settings', href: '#' },
        { label: 'Roles', href: '#' }
    ];
    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Role Group Code", key: "role_group_code", sortable: true },
        { label: "Role Group Name", key: "role_group_name", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];



    const fetchRoles = async (page = 1, limit = pageSize, sort = sortBy, sortOrder = order) => {
        try {
            setLoading(true);
            const response = await axiosWrapper(
                `api/v1/role-groups/paginateRoleGroups?page=${page}&limit=${limit}&sortBy=${sort}&order=${sortOrder}`,
                { method: 'POST' }
            );

            const mappedRows = response.roleGroups.map((role, index) => [
                index + 1,
                role.role_group_code,
                role.role_group_name,
                role.status ? 'Active' : 'Inactive',
            ]);

            setRoles(mappedRows);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch roles:", error.message || error);
        }
        finally{
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
    } finally{
        setLoading(false);
    }
};

    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1); // reset to first page on sort
    };
// if (loading) return <Loader />;
    return (
        <>
            <div className="tb-responsive templatebuilder-body">
                <div className="pt-3">
                    <Breadcrumb title="Roles" items={breadcrumbItems} />
                    <Navbar modalTitle="Add Role" modalFields={roleFields} onSubmit={handleRoleSubmit} />
                    <Table
                        headers={headers}
                        rows={roles}
                        sortBy={sortBy}
                        order={order}
                        onSortChange={handleSortChange}
                        paginationProps={{
                            currentPage,
                            totalPages,
                            pageSize,
                            onPageChange: setCurrentPage,
                            onPageSizeChange: (size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                            }
                        }}
                    />

                </div>
            </div>
        </>
    );
};

export default Role;
