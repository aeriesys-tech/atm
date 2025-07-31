import React, { useEffect, useRef, useState } from "react";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Breadcrumb from "../../components/general/Breadcrum";
import Navbar from "../../components/general/Navbar";
import Table from "../../components/common/Table";
import { useNavigate, useParams } from "react-router";
import search2 from "../../assets/icons/search2.svg";
import Search from "../../components/common/Search";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";

const TemplateTypes = () => {
    const { id: templateTypeId } = useParams();
    const [templateTypes, setTemplateTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("template_name");
    const [order, setOrder] = useState("asc");
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [templateTypeDetails, setTemplateTypeDetails] = useState(null);

    const debounceRef = useRef(null);
    const navigate = useNavigate();

    const breadcrumbItems = [
        { label: "Templates", href: "#" },
        {
            label: templateTypeDetails?.template_type_name || "Template Types",
            href: "#",
        },
    ];

    const headers = [
        { label: "#", key: "index", sortable: false },
        { label: "Template Name", key: "template_name", sortable: true },
        { label: "Template Code", key: "template_code", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    const fetchTemplateTypes = async (
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

            if (templateTypeId) {
                params.append("template_type_id", templateTypeId);
            }
            if (searchText?.trim()) params.append("search", searchText.trim());
            if (status === "active") params.append("status", "true");
            else if (status === "inactive") params.append("status", "false");

            const response = await axiosWrapper(
                `api/v1/templates/paginatedTemplates?${params.toString()}`,
                { method: "POST" }
            );

            const mapped = response?.templates?.map((tpl, index) => ({
                ...tpl,
                index: index + 1 + (page - 1) * pageSize,
            }));
            setTemplateTypes(mapped);
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
            setTotalItems(response.totalItems);
            setTemplateTypeDetails(response.templateType);
        } catch (error) {
            // console.error("Error fetching template types:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplateTypes(currentPage, pageSize, sortBy, order, statusFilter, search);
    }, [currentPage, pageSize, sortBy, order, statusFilter, , templateTypeId]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchTemplateTypes(1, pageSize, sortBy, order, statusFilter, val);
        }, 500);
    };

    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (row) => {
        try {

            const response = await axiosWrapper("api/v1/templates/deleteTemplate", {
                method: "POST",
                data: {
                    id: row._id, // 👈 send single ID
                },
            });
            fetchTemplateTypes(currentPage, pageSize, sortBy, order, statusFilter, search);
        } catch (error) {
            alert(
                error?.response?.data?.message || "Failed to update template status"
            );
        }
    };

    const handleDelete = async (row) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to permanently delete this template?");
            if (!confirmDelete) return;

            const response = await axiosWrapper("api/v1/templates/destroyTemplate", {
                method: "POST",
                data: { id: row._id, },
            });
            fetchTemplateTypes();
        } catch (error) {
            // console.error("Failed to delete template:", error.message || error);
            alert(error?.message?.message);
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
                <Breadcrumb
                    title={templateTypeDetails?.template_type_name || "Template Types"}
                    items={breadcrumbItems}
                />
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
                        <Button
                            name="Create New Template"
                            onClick={() =>
                                navigate("/template_add", {
                                    state: {
                                        templateTypeId: templateTypeId,
                                        templateTypeName: templateTypeDetails?.template_type_name,
                                    },
                                })
                            }
                        />
                    </div>
                </div>

                <Table
                    headers={headers}
                    rows={templateTypes}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(row) =>
                        navigate(`/template/${templateTypeId}/edit/${row._id}`, {
                            state: {
                                templateCode: row.template_code,
                                templateName: row.template_name,
                                structure: row.structure,
                                templateTypeId: templateTypeId,
                                templateTypeName: templateTypeDetails?.template_type_name,
                            },
                        })
                    }
                    onDelete={handleDelete}
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

export default TemplateTypes;
