import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import axiosWrapper from "../../../services/AxiosWrapper";
import Modal from "../../components/common/Modal";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Search from "../../components/common/Search";
import search2 from "../../../src/assets/icons/search2.svg";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import { toast } from "react-toastify";

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
    const [addFormData, setAddFormData] = useState({ roleCode: "", roleName: "" });
    const [addErrors, setAddErrors] = useState({});
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const debounceTimeoutRef = useRef(null);
    const breadcrumbItems = [
        { label: "Configure", href: "#" },
        { label: "User Settings", href: "#" },
        { label: "Role Groups", href: "#" },
    ];

    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Role Group Code", key: "role_group_code", sortable: true },
        { label: "Role Group Name", key: "role_group_name", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    const roleFields = [
        {
            label: "Role Group Code",
            name: "roleCode",
            type: "text",
            placeholder: "Enter role code",
            required: true,
        },
        {
            label: "Role Group Name",
            name: "roleName",
            type: "text",
            placeholder: "Enter role name",
            required: true,
        },
    ];

    const handleEditClick = (rowData) => {
        setEditFormData({
            id: rowData._id,
            roleCode: rowData.role_group_code || "",
            roleName: rowData.role_group_name || "",
            status: rowData.status ?? true,
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
            console.error("");
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

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setAddFormData((prev) => ({ ...prev, [name]: value }));
        setAddErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on input change
    };

   const handleRoleSubmit = async (formData, setErrors, onSuccess) => {
    // Client-side validation
    const errors = {};
    if (!formData.roleCode) errors.roleCode = "Role group code is required";
    if (!formData.roleName) errors.roleName = "Role group name is required";

    try {
      setLoading(true);
      const payload = {
        role_group_code: formData.roleCode,
        role_group_name: formData.roleName,
      };

      console.log("Submitting payload:", payload);

      const res = await axiosWrapper("api/v1/role-groups/createRoleGroup", {
        method: "POST",
        data: payload,
      });

      console.log(res);
      toast.success("Role group created successfully", { autoClose: 3000 });
      onSuccess();
      fetchRoles();
    } catch (err) {
      console.log("API error:", err);
      const apiErrors = err?.message?.errors || err?.response?.data?.errors || {};
      const newErrors = {
        roleCode: apiErrors.role_group_code || "",
        roleName: apiErrors.role_group_name || "",
      };
      setErrors(newErrors);
      console.log("Setting errors:", newErrors);
      toast.error(err?.message?.message || "Failed to create role group", {
        autoClose: 3000,
      });
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

      const res = await axiosWrapper("api/v1/role-groups/updateRoleGroup", {
        method: "POST",
        data: payload,
      });
      toast.success(res?.message || "Role group updated successfully", { autoClose: 3000 });
      onSuccess();
      fetchRoles();
      setEditModalOpen(false);
    } catch (err) {
      console.log("API error:", err);
      const apiErrors = err?.response?.data?.errors || err?.message?.errors || {};
      const newErrors = {
        roleCode: apiErrors.role_group_code || "",
        roleName: apiErrors.role_group_name || "",
      };
      setErrors(newErrors);
      console.log("Setting errors:", newErrors);
      toast.error(err?.message?.message || "Failed to update role group", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (row) => {
    console.log("handleToggleStatus called for row:", row);
    try {
      setLoading(true);
      const response = await axiosWrapper("api/v1/role-groups/deleteRoleGroup", {
        method: "POST",
        data: { id: row._id },
      });
      console.log("Toggle status response:", response);
      toast.success(response?.message || "Role group status toggled successfully", {
        autoClose: 3000,
      });
      fetchRoles(currentPage, pageSize, sortBy, order, statusFilter);
    } catch (err) {
      console.error("Failed to toggle role status:", err);
      toast.error(err?.message?.message || "Failed to toggle status", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoleGroup = async (row) => {
    console.log("handleDeleteRoleGroup called for row:", row);
    const confirmDelete = window.confirm("Are you sure you want to delete this role group permanently?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await axiosWrapper("api/v1/role-groups/destroyRoleGroup", {
        method: "POST",
        data: { id: row._id },
      });
      console.log("Delete response:", response);
      toast.success(response?.message || "Role group deleted successfully", {
        autoClose: 3000,
      });
      fetchRoles();
    } catch (err) {
      console.error("Failed to delete role group:", err);
      toast.error(err?.message?.message || "Failed to delete role group", {
        autoClose: 3000,
      });
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
        <>
            <div className="tb-responsive templatebuilder-body position-relative">
                {loading && (
                    <div className="loader-overlay d-flex justify-content-center align-items-center">
                        <Loader />
                    </div>
                )}
                <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                    <Breadcrumb title="Role Group" items={breadcrumbItems} />

                    {/* Navbar UI */}
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
                                    { label: "Inactive", value: "inactive" },
                                ]}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <Button name="Add Role Group" onClick={() => setAddModalOpen(true)} />
                        </div>
                    </div>

                    {/* Add Role Group Modal */}
                    {addModalOpen && (
                        <Modal
                            title="Add Role Group"
                            fields={roleFields}
                            values={addFormData}
                            errors={addErrors}
                            onChange={handleAddInputChange}
                            onSubmit={() =>
                                handleRoleSubmit(addFormData, setAddErrors, () => {
                                    setAddModalOpen(false);
                                    setAddFormData({ roleCode: "", roleName: "" });
                                    setAddErrors({});
                                })
                            }
                            onClose={() => {
                                setAddModalOpen(false);
                                setAddFormData({ roleCode: "", roleName: "" });
                                setAddErrors({});
                            }}
                            submitButtonLabel="ADD"
                        />
                    )}

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
                            },
                        }}
                    />

                    {/* Edit Role Group Modal */}
                    {editModalOpen && (
                        <Modal
                            title="Edit Role Group"
                            fields={roleFields}
                            values={editFormData}
                            errors={editErrors}
                            onChange={(e) => {
                                const { name, value } = e.target;
                                setEditFormData((prev) => ({ ...prev, [name]: value }));
                                setEditErrors((prev) => ({ ...prev, [name]: "" }));
                            }}
                            onSubmit={() =>
                                handleUpdateSubmit(editFormData, setEditErrors, () => {
                                    setEditModalOpen(false);
                                    setEditFormData({});
                                    setEditErrors({});
                                })
                            }
                            onClose={() => {
                                setEditModalOpen(false);
                                setEditFormData({});
                                setEditErrors({});
                            }}
                            submitButtonLabel="UPDATE"
                        />
                    )}
                </div>
            </div>
        </>
    );
};


export default RoleGroup;
