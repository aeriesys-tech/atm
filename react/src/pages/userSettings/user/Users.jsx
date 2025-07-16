import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosWrapper from "../../../../services/AxiosWrapper";
import Table from "../../../components/common/Table";
import Breadcrumb from "../../../components/general/Breadcrum";
import search2 from "../../../assets/icons/search2.svg";
import Button from "../../../components/common/Button";
import Search from "../../../components/common/Search";
import Dropdown from "../../../components/common/Dropdown";
import Loader from "../../../components/general/LoaderAndSpinner/Loader";

const User = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const breadcrumbItems = [
    { label: 'Configure', href: '#' },
    { label: 'User Settings', href: '#' },
    { label: 'Users', href: '#' }
  ];

  const headers = [
    { label: "#", key: "index", sortable: false },
    { label: "Name", key: "name", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Mobile", key: "mobile_no", sortable: true },
    { label: "Status", key: "status", sortable: false },
    { label: "Action", key: "action", sortable: false },
  ];

  const fetchUsers = async (
    page = 1,
    limit = pageSize,
    sortField = sortBy,
    sortOrder = order
  ) => {
    try {
      setLoading(true);
      const response = await axiosWrapper(
        `api/v1/users/paginateUsers?page=${page}&limit=${limit}&sortBy=${sortField}&order=${sortOrder}`,
        { method: "GET" }
      );

      const mappedUsers = response.users.map((user, index) => ({
        ...user,
        index: index + 1 + (page - 1) * limit,
        status: user.status ,
      }));

      setUsers(mappedUsers);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching users:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, pageSize, sortBy, order);
  }, [currentPage, pageSize, sortBy, order]);

  const handleSoftDelete = async (row) => {
    try {
      setLoading(true);
      await axiosWrapper("api/v1/users/deleteUser", {
        method: "POST",
        data: { id: row._id },
      });
      fetchUsers();
    } catch (error) {
      console.error("Soft delete failed:", error.message || error);
    } finally {
      setLoading(false);
    }
  };
const handlePermanentDeleteUser = async (row) => {
  const confirmDelete = window.confirm("Are you sure you want to permanently delete this user?");
  if (!confirmDelete) return;

  try {
    setLoading(true);

    const response = await axiosWrapper("api/v1/users/destroyUser", {
      method: "POST",
      data: { id: row._id },
    });

    if (response?.message) {
      alert(response.message); // shows: "user permanently deleted"
    }

    fetchUsers(); // refresh the user list
  } catch (error) {
    console.error("Permanent delete failed:", error.message || error);
    alert("Error deleting user");
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
        <Breadcrumb title="Users" items={breadcrumbItems} />

        {/* 👇 Replaced Navbar with UI + navigation logic */}
        <div className="navbar-3 mt-0 d-flex justify-content-between">
          <div className="d-flex gap-4">
            <div className="search-container">
              <img src={search2} alt="Search" />
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

            <Button name="Add User" onClick={() => navigate("/users/add")} />
          </div>
        </div>

        <Table
          headers={headers}
          rows={users}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          onEdit={(row) =>
            navigate(`/users/edit/${row._id}`, { state: { user: row } })
          }

          onToggleStatus={handleSoftDelete}
          onDelete={handlePermanentDeleteUser}
          paginationProps={{
            currentPage,
            totalPages,
            totalItems,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
          }}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default User;
