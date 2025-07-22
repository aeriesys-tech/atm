import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import Modal from "../../components/common/Modal";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../../components/general/LoaderAndSpinner/Loader";

import { setNotificationCount } from "../../redux/user/UserSlice";
import { useDispatch } from "react-redux";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [sortBy, setSortBy] = useState("notification_code");
    const [order, setOrder] = useState("asc");
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const dispatch = useDispatch();
    const breadcrumbItems = [
        // { label: "Notifications", href: "#" },
    ];

    const headers = [
        { label: "# ID", key: "index", sortable: true },
        { label: "Date Time", key: "date_time", sortable: true },
        { label: "Notification", key: "notification", sortable: true },
        { label: "Module Name", key: "module_name", sortable: true },
        { label: "User", key: "user_id", sortable: true },
        { label: "Action", key: "action", sortable: false },
    ];

    const fetchNotifications = async (page = 1, limit = pageSize, sort = sortBy, sortOrder = order) => {
        try {
            setLoading(true);

            const response = await axiosWrapper(
                `api/v1/notifications/paginateNotifications?page=${page}&limit=${limit}&sortBy=${sort}&order=${sortOrder}`,
                { method: 'POST' }
            );

            const mappedRows = response.notifications.map((notification, index) => {
                const user = users.find(u => u._id === notification.user_id);
                return {
                    _id: notification._id,
                    index: index + 1 + (page - 1) * pageSize,
                    date_time: notification.date_time,
                    module_name: notification.module_name,
                    notification: notification.notification,
                    user_id: user ? user.name : "-",
                };
            });


            setNotifications(mappedRows);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            console.error("Failed to fetch notifications:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosWrapper("api/v1/users/getUsers", {
                method: "POST",
            });
            setUsers(response.users);
            // fetchNotifications(currentPage, pageSize, sortBy, order, response.users);
        } catch (error) {
            console.error("Failed to fetch notification groups:", error.message || error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (users && users.length) {
            fetchNotifications(currentPage, pageSize, sortBy, order);
        }
    }, [users, currentPage, pageSize, sortBy, order]);

    const notificationFields = [
        {
            label: "Notification Code",
            name: "notification_code",
            type: "text",
            placeholder: "Enter notification code",
            required: true,
        },
        {
            label: "Notification Name",
            name: "notification_name",
            type: "text",
            placeholder: "Enter notification name",
            required: true,
        },
        {
            label: "Notification Group",
            name: "notification_group_id",
            type: "dropdown",
            required: true,
            options: users?.map(group => ({
                label: group.notification_group_name,
                value: group._id,
            })),
        },
    ];

    const handleNotificationSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);
            const payload = {
                notification_group_id: formData.notification_group_id,
                notification_code: formData.notification_code,
                notification_name: formData.notification_name,
            };

            await axiosWrapper("api/v1/notifications/createNotification", {
                method: "POST",
                data: payload,
            });

            onSuccess();
            fetchNotifications(currentPage, pageSize, sortBy, order);

        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors({
                    notification_group_id: apiErrors.notification_group_id,
                    notification_code: apiErrors.notification_code,
                    notification_name: apiErrors.notification_name,
                });
            } else {
                setErrors({ notification_name: "Unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (row) => {
        setEditErrors({});
        setEditFormData({
            id: row._id,
            notification_group_id: row.notification_group_id,
            notification_code: row.notification_code,
            notification_name: row.notification_name,
            status: row.status,
        });
        setEditModalOpen(true);
    };



    const handleUpdateSubmit = async (formData, setErrors, onSuccess) => {
        try {
            setLoading(true);

            const payload = {
                id: formData.id, // 👈 pass ID in body instead of params
                notification_group_id: formData.notification_group_id,
                notification_code: formData.notification_code,
                notification_name: formData.notification_name,
                status: formData.status ?? true,
            };

            await axiosWrapper("api/v1/notifications/updateNotification", {
                method: "POST",
                data: payload
            });

            onSuccess(); // Close modal
            fetchNotifications(currentPage, pageSize, sortBy, order);

            setEditModalOpen(false);
        } catch (err) {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors) {
                setErrors({
                    notification_group_id: apiErrors.notification_group_id,
                    notification_code: apiErrors.notification_code,
                    notification_name: apiErrors.notification_name,
                });
            } else {
                setErrors({ notification_name: "Unexpected error occurred" });
            }
        } finally {
            setLoading(false);
        }
    };


    const handleToggleStatus = async (row) => {
        try {
            setLoading(true);

            await axiosWrapper("api/v1/notifications/deleteNotification", {
                method: "POST",
                data: { id: row._id },
            });
            fetchNotifications(currentPage, pageSize, sortBy, order);

        } catch (err) {
            console.error("Failed to toggle notification status:", err.message || err);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteNotification = async (row) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this notification permanently?");
        if (!confirmDelete) return;

        try {
            setLoading(true);
            const response = await axiosWrapper("api/v1/notifications/destroyNotification", {
                method: "POST",
                data: { id: row._id },
            });

            if (response?.message) {
                alert(response.message);
            }
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification permanently:", error.message || error);
            alert("Error deleting notification");
        } finally {
            setLoading(false);
        }
    };

    const getNotificationCount = async () => {
        try {
            const response = await axiosWrapper(
                `api/v1/notifications/countUnreadNotifications`,
                { method: 'POST' }
            );
            console.log(response.data)
            dispatch(setNotificationCount(response.data));

        } catch (error) {
            console.error("Failed to fetch roles:", error.message || error);
        }
    };

    const addNotificationUser = async (id) => {
        try {
            setLoading(true);

            const response = await axiosWrapper("api/v1/notifications/createNotificationUser", {
                method: "POST",
                data: { id },
            });
            if (response?.data) {
                console.log("Notification user added:", response.data);
            }
            getNotificationCount();

        } catch (error) {
            console.error("Failed to add notification user:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = async (row) => {
        try {
            setLoading(true);

            const response = await axiosWrapper("api/v1/notifications/getNotification", {
                method: "POST",
                data: { id: row._id },
            });

            if (response?.data) {
                console.log("Selected row:", response.data);
                setSelectedRow(response.data);
                setIsModalOpen(true);
            }

            // Use row._id for adding notification user
            await addNotificationUser(row._id);

        } catch (error) {
            console.error("Failed to view notification:", error.message || error);
            alert("Error viewing notification");
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
                <Breadcrumb title="Notifications" items={breadcrumbItems} />

                <Table
                    headers={headers}
                    rows={notifications}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onEdit={handleEditClick}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteNotification}
                    onView={handleViewClick}
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
                        title="Edit Notification"
                        fields={notificationFields}
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

export default Notification;
