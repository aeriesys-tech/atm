// Notification.jsx
import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/general/Breadcrum";
import Table from "../../components/common/Table";
import Navbar from "../../components/general/Navbar";
import Modal from "../../components/common/Modal";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import search2 from "../../assets/icons/search2.svg";
import { setNotificationCount } from "../../redux/user/UserSlice";
import { useDispatch } from "react-redux";
import Dropdown from "../../components/common/Dropdown";
import Search from "../../components/common/Search";
import Button from "../../components/common/Button";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [notificationUserIds, setNotificationUserIds] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [selectedUserId, setSelectedUserId] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("notification_code");
    const [order, setOrder] = useState("desc");
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const headers = [
        { label: "#", key: "index", sortable: true },
        { label: "Module", key: "module_name", sortable: true },
        { label: "Message", key: "notification", sortable: true },
        { label: "Updated By", key: "user_id", sortable: true },
        { label: "Updated At", key: "date_time", sortable: true },
        { label: "Action", key: "action", sortable: false },
    ];

    const fetchNotificationUsers = async () => {
        try {
            const response = await axiosWrapper("api/v1/notifications/getNotificationUsers", {
                method: "POST",
            });
            const ids = response.notification_users.map(nu => String(nu.notification_id));
            setNotificationUserIds(ids);
        } catch (error) {
            console.error("Failed to fetch notification users:", error.message || error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const payload = {};
            if (selectedUserId) payload.user_id = selectedUserId;

            const response = await axiosWrapper(
                `api/v1/notifications/paginateNotifications?page=${currentPage}&limit=${pageSize}&sortBy=${sortBy}&order=${order}`,
                { method: 'POST', data: payload }
            );

            const mappedRows = response.notifications.map((notification, index) => {
                const user = users.find(u => u._id === notification.user_id);
                const date = new Date(notification.date_time);
                const formattedDateTime = date.toLocaleString('en-US', {
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: true, day: '2-digit', month: '2-digit', year: 'numeric',
                });

                const isUnread = !notificationUserIds.includes(String(notification._id));

                return {
                    _id: notification._id,
                    index: index + 1 + (currentPage - 1) * pageSize,
                    date_time: formattedDateTime,
                    module_name: notification.module_name,
                    notification: notification.notification || '',
                    user_id: user ? user.name : "-",
                    isUnread,
                };
            });

            setNotifications(mappedRows);
            setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);

            console.log("DEBUG - Notifications Mapped Rows:", mappedRows);
        } catch (error) {
            console.error("Failed to fetch notifications:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosWrapper("api/v1/users/getUsers", { method: "POST" });
            setUsers(response.users);
        } catch (error) {
            console.error("Failed to fetch users:", error.message || error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchUsers();
            await fetchNotificationUsers();
        };
        init();
    }, []);

    useEffect(() => {
        if (users.length) {
            fetchNotifications();
        }
    }, [users, notificationUserIds, currentPage, pageSize, sortBy, order, selectedUserId]);

    const getNotificationCount = async () => {
        try {
            const response = await axiosWrapper("api/v1/notifications/countUnreadNotifications", {
                method: 'POST',
            });
            dispatch(setNotificationCount(response.data));
        } catch (error) {
            console.error("Failed to fetch notification count:", error.message || error);
        }
    };

    const readAllNotifications = async () => {
        try {
            await axiosWrapper("api/v1/notifications/readAllNotifications", { method: 'POST' });
            await fetchNotificationUsers();
            getNotificationCount();
        } catch (error) {
            console.error("Failed to mark notifications as read:", error.message || error);
        }
    };

    const addNotificationUser = async (id) => {
        try {
            setLoading(true);
            await axiosWrapper("api/v1/notifications/createNotificationUser", {
                method: "POST", data: { id },
            });
            getNotificationCount();
            await fetchNotificationUsers();
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
                method: "POST", data: { id: row._id },
            });
            if (response?.data) {
                setSelectedRow(response.data);
                setIsModalOpen(true);
            }
            await addNotificationUser(row._id);
        } catch (error) {
            console.error("Failed to view notification:", error.message || error);
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
                <div className="">
                    <Loader />
                </div>
            )}
            <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                <Breadcrumb title="Notifications" items={[]} />
                <div className="navbar-3 mt-0 d-flex justify-content-between">
                    <div className="d-flex gap-4">
                        <div className="search-container">
                            <img src={search2} alt="Search" />
                            <Search />
                        </div>
                    </div>
                    <div className="d-flex gap-3">
                        <Dropdown
                            label="Users"
                            options={[
                                { label: "All Users", value: "" },
                                ...users.map(user => ({ label: user.name, value: user._id }))
                            ]}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        />
                        <Button name="Read All"  onClick={readAllNotifications} />
                    </div>
                </div>
                <Table
                    headers={headers}
                    rows={notifications}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onView={handleViewClick}
                    selectedRow={selectedRow}
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
        </div>
    );
};

export default Notification;
