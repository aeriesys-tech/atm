import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import axiosWrapper from "../../../services/AxiosWrapper";
import Modal from "../../components/common/Modal";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import search2 from "../../../src/assets/icons/search2.svg";
import Search from "../../components/common/Search";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import { toast } from "react-toastify";

const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("department_code");
    const [order, setOrder] = useState("asc");
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState('');
const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    department_code: "",
    department_name: "",
  });
   const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [addErrors, setAddErrors] = useState({});


    const debounceTimeoutRef = useRef(null);
    const breadcrumbItems = [
        { label: "Configure", href: "#" },
        { label: "Organization", href: "#" },
        { label: "Departments", href: "#" },
    ];

    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Department Code", key: "department_code", sortable: true },
        { label: "Department Name", key: "department_name", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    const fetchDepartments = async (page = 1, limit = pageSize, sort = sortBy, sortOrder = order, status = statusFilter,
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
                `api/v1/departments/paginateDepartments?${params.toString()}`,
                {
                    method: 'POST',
                }
            );

            const mappedRows = response.Departments.map((dept, index) => ({
                _id: dept._id,
                index: index + 1,
                department_code: dept.department_code,
                department_name: dept.department_name,
                status: dept.status,
            }));

            setDepartments(mappedRows);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            // console.error("Failed to fetch departments:", error.message || error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchDepartments(currentPage, pageSize, sortBy, order, statusFilter, search);
    }, [currentPage, pageSize, sortBy, order, statusFilter]);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);

        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            fetchDepartments(1, pageSize, sortBy, order, statusFilter, val);
        }, 500);
    };
    const departmentFields = [
        {
            label: "Department Code",
            name: "department_code",
            type: "text",
            placeholder: "Enter department code",
            required: true,
        },
        {
            label: "Department Name",
            name: "department_name",
            type: "text",
            placeholder: "Enter department name",
            required: true,
        },
    ];

    const handleCreateSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);
            const payload = {
                department_code: formData.department_code,
                department_name: formData.department_name,
            };
            const response=await axiosWrapper("api/v1/departments/createDepartment", {
                method: "POST",
                data: payload,
            });
            toast.success(response?.message || "Department created successfully", {
        autoClose: 3000,
      });
            onSuccess();
            fetchDepartments();
        } catch (err) {
             const apiErrors = err?.message?.errors || err?.response?.data?.errors;
      setErrors({
        department_code: apiErrors?.department_code || "",
        department_name: apiErrors?.department_name || "",
      });
      toast.error(err?.message?.message || "Failed to create department", {
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
                id: formData.id,
                department_code: formData.department_code,
                department_name: formData.department_name,
                status: formData.status ?? true,
                // deleted_at: null
            };
            const response = await axiosWrapper("api/v1/departments/updateDepartment", {
                method: "POST",
                data: payload,
            });
            toast.success(response?.message || "Department updated successfully", {
        autoClose: 3000,
      });
            onSuccess();
            fetchDepartments();
            setEditModalOpen(false);
        } catch (err) {
             const apiErrors = err?.message?.errors || err?.response?.data?.errors;
      setErrors({
        department_code: apiErrors?.department_code || "",
        department_name: apiErrors?.department_name || "",
      });
      toast.error(err?.message?.message || "Failed to update department", {
        autoClose: 3000,
      });
        } finally {
            setLoading(false);
        }
    };
    const handleEditClick = (rowData) => {
        setEditErrors({})
        setEditFormData({
            id: rowData._id,
            department_code: rowData.department_code,
            department_name: rowData.department_name,
            status: rowData.status,
        });
        setEditModalOpen(true);
    };

    const handleToggleStatus = async (row) => {
        try {
            setLoading(true);
            const response=await axiosWrapper("api/v1/departments/deleteDepartment", {
                method: "POST",
                data: { id: row._id },
            });
            toast.success(response?.message || "Department status successfully Changed", {
        autoClose: 3000,
      });
            fetchDepartments(currentPage, pageSize, sortBy, order, statusFilter);
        } catch (err) {
            // console.error("Failed to toggle department status:", err.message || err);
              toast.error(err?.message?.message || "Failed to update department", {
        autoClose: 3000,
      });
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteDepartment = async (row) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this department permanently?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            const response = await axiosWrapper("api/v1/departments/destroyDepartment ", {
                method: "POST",
                data: { id: row._id },
            });

            toast.success(response?.message || "Department deleted successfully", {
        autoClose: 3000,
      });

            fetchDepartments(); // Refresh the table
        } catch (error) {
            // console.error("Failed to delete department permanently:", error.message || error);
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
                <Breadcrumb title="Departments" items={breadcrumbItems} />
                <div className="d-flex justify-content-between mb-3">
          <div className="search-container d-flex align-items-center">
            <img src={search2} alt="Search" />
            <Search value={search} onChange={handleSearchChange} />
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
            <Button
              name="Add Department"
              onClick={() => setAddModalOpen(true)}
            />
          </div>
        </div>
        {addModalOpen && (
          <Modal
            title="Add Department"
            fields={departmentFields}
            values={addFormData}
            errors={addErrors}
            onChange={handleAddInputChange}
            onSubmit={() =>
              handleCreateSubmit(addFormData, setAddErrors, () => {
                setAddModalOpen(false);
                setAddFormData({ department_code: "", department_name: "" });
                setAddErrors({});
              })
            }
            onClose={() => {
              setAddModalOpen(false);
              setAddFormData({ department_code: "", department_name: "" });
              setAddErrors({});
            }}
            submitButtonLabel="ADD"
          />
        )}

                <Table
                    headers={headers}
                    rows={departments}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onDelete={handleDeleteDepartment}
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
                    onEdit={handleEditClick}
                    onToggleStatus={handleToggleStatus}
                />
                {editModalOpen && (
                    <Modal
                        title="Edit Department"
                        fields={departmentFields}
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
    );
};

export default Department;