import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Breadcrumb from "../../components/general/Breadcrum";
import Search from "../../components/common/Search";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import search2 from "../../assets/icons/search2.svg";
const AllAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("asset_name");
    const [order, setOrder] = useState("asc");
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedAssetId, setSelectedAssetId] = useState(""); // Track selected asset
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    const breadcrumbItems = [
        { label: "My Assets", href: "#" },
        { label: "All Assets", href: "#" },
    ];

    const headers = [
        { label: "#", key: "index", sortable: false },
        { label: "Asset Name", key: "asset_name", sortable: true },
        { label: "Asset Code", key: "asset_code", sortable: true },
        { label: "Status", key: "status", sortable: false },
        { label: "Action", key: "action", sortable: false },
    ];

    // Hardcoded options for the Dropdown (replace with valid asset_id values if possible)
    const assetOptions = [
        { label: "Asset Class 1", value: "asset1" },
        { label: "Asset Class 2", value: "asset2" },
        { label: "Asset Class 3", value: "asset3" },
        { label: "Asset Class 4", value: "asset4" },
    ];

    // Fetch all assets
    const fetchAssets = async (
        page = 1,
        limit = pageSize,
        sort = sortBy,
        sortOrder = order,
        status = statusFilter,
        searchText = search,
        assetId = selectedAssetId
    ) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);
            params.append("sortBy", sort);
            params.append("order", sortOrder);

            if (assetId) {
                params.append("asset_id", assetId);
            }
            if (searchText?.trim()) params.append("search", searchText.trim());
            if (status === "active") params.append("status", "true");
            else if (status === "inactive") params.append("status", "false");

            const response = await axiosWrapper(
                `api/v1/assets/paginateAssets?${params.toString()}`,
                { method: "POST" }
            );

            const mapped = response?.assets?.map((tpl, index) => ({
                ...tpl,
                index: index + 1 + (page - 1) * pageSize,
            })) || [];
            setAssets(mapped);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(response.currentPage || 1);
            setTotalItems(response.totalItems || 0);
            console.log("Fetch Assets Response:", {
                assets: mapped,
                totalItems: response.totalItems,
                selectedAssetId: assetId,
            });
        } catch (error) {
            console.error("Error fetching assets:", error.message || error);
            setAssets([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets(currentPage, pageSize, sortBy, order, statusFilter, search, selectedAssetId);
    }, [currentPage, pageSize, sortBy, order, statusFilter, search, selectedAssetId]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchAssets(1, pageSize, sortBy, order, statusFilter, val, selectedAssetId);
        }, 500);
    };

    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (row) => {
        try {
            const response = await axiosWrapper("api/v1/assets/deleteasset", {
                method: "POST",
                data: { id: row._id },
            });
            fetchAssets(currentPage, pageSize, sortBy, order, statusFilter, search, selectedAssetId);
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to update asset status");
        }
    };

    const handleDelete = async (row) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to permanently delete this asset?");
            if (!confirmDelete) return;

            const response = await axiosWrapper("api/v1/assets/destroyasset", {
                method: "POST",
                data: { id: row._id },
            });
            fetchAssets(currentPage, pageSize, sortBy, order, statusFilter, search, selectedAssetId);
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to delete asset");
        }
    };

    const downloadExcel = async () => {
        try {
            console.log("Downloading Excel for asset:", selectedAssetId);
            // Implement your download logic here
            // Example: await axiosWrapper("api/v1/assets/export", { method: "GET", params: { asset_id: selectedAssetId } });
        } catch (error) {
            alert("Failed to download Excel file");
        }
    };

    return (
        <div className="tb-responsive assetbuilder-body position-relative">
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                <Breadcrumb title="All Assets" items={breadcrumbItems} />
                <div className="navbar-3 mt-0 d-flex justify-content-between">
                    <div className="d-flex gap-4">
                        {totalItems >= 1 && (
                            <div className="search-container">
                                <img src={search2} alt="Search" />
                                <Search value={search} onChange={handleSearchChange} />
                            </div>
                        )}
                    </div>
                    <div className="d-flex gap-3">
                        <Dropdown
                            label="Asset Class"
                            options={assetOptions}
                            value={selectedAssetId}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                console.log("Dropdown selected value:", newValue);
                                setSelectedAssetId(newValue);
                                setCurrentPage(1);
                            }}
                        />
                        {/* Temporarily relax the condition to test button visibility */}
                        {selectedAssetId ? (
                            <Button
                                name="Download"
                                onClick={downloadExcel}
                                icon="download-icon"
                                disabled={!selectedAssetId}
                            />
                        ) : (
                            <div>
                            </div>
                        )}
                        <Button
                            name="Add Equipment"
                            onClick={() => navigate("/add_equipment")}
                            icon="plus-icon"
                        />
                    </div>
                </div>
                <Table
                    headers={headers}
                    rows={assets}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(row) =>
                        navigate(`/asset/edit/${row._id}`, {
                            state: {
                                assetCode: row.asset_code,
                                assetName: row.asset_name,
                                structure: row.structure,
                            },
                        })
                    }
                    onViewTemplate={(row) =>
                        navigate(`/asset/view/${row._id}`, {
                            state: {
                                assetCode: row.asset_code,
                                assetName: row.asset_name,
                                structure: row.structure,
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
export default AllAssets