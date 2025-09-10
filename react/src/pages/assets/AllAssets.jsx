import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Breadcrumb from "../../components/general/Breadcrum";
import Search from "../../components/common/Search";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import search2 from "../../assets/icons/search2.svg";
import downloadicon from "../../assets/icons/lucide_download.svg"
import axiosWrapper from "../../../services/AxiosWrapper";
import { toast } from "react-toastify";
import plusIcon from "../../../src/assets/icons/plus1.svg"

const AllAssets = () => {
    const [assets, setAssets] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [assetAttributes, setAssetAttributes] = useState([]); // Store assetAttribute from API
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('created_at'); // Default sort by created_at
    const [order, setOrder] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [selectedAssetName, setSelectedAssetName] = useState('');
    const debounceRef = useRef(null);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    const breadcrumbItems = [
        { label: 'My Assets', href: '#' },
        { label: 'All Assets', href: '#' },
    ];

    // Dynamic headers based on assetAttribute only
    const headers = [
        { label: '#', key: 'index', sortable: false },
        ...assetAttributes.map((attr) => ({
            label: attr.display_name,
            key: attr.display_name, // Use display_name as key since equipment uses it
            sortable: true,
        })),
        { label: 'Action', key: 'action', sortable: false },
    ];

    const fetchAssetClasses = async () => {
        try {
            const response = await axiosWrapper('api/v1/assets/getAssets', { method: 'POST' });
            const options = response?.map((a) => ({
                label: a.asset_name,
                value: a._id,
            })) || [];
            setAssets(options);
        } catch (error) {
            console.error('Error fetching asset classes:', error);
            toast.error('Failed to fetch asset classes');
        }
    };

    const fetchEquipments = async (
        page = 1,
        limit = pageSize,
        sort = sortBy,
        sortOrder = order,
        searchText = search,
        assetId = selectedAssetId
    ) => {
        if (!assetId) {
            setEquipments([]);
            setAssetAttributes([]);
            setTotalItems(0);
            return;
        }

        try {
            setLoading(true);
            const response = await axiosWrapper('api/v1/equipments/paginateEquipments', {
                method: 'POST',
                data: {
                    page,
                    limit,
                    sortBy: sort,
                    order: sortOrder,
                    search: searchText,
                    asset_id: assetId,
                },
            });

            // Store asset attributes
            setAssetAttributes(response?.assetAttribute || []);

            const mapped = response?.equipments?.map((eq, index) => ({
                ...eq,
                index: index + 1 + (page - 1) * limit,
            })) || [];

            setEquipments(mapped);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(response.currentPage || 1);
            setTotalItems(response.totalItems || 0);

            console.log('Equipments Response:', response);
        } catch (error) {
            console.error('Error fetching equipments:', error.message || error);
            setEquipments([]);
            setAssetAttributes([]);
            toast.error('Failed to fetch equipments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssetClasses();
    }, []);

    useEffect(() => {
        if (selectedAssetId) {
            fetchEquipments(currentPage, pageSize, sortBy, order, search, selectedAssetId);
        }
    }, [currentPage, pageSize, sortBy, order, search, selectedAssetId]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setCurrentPage(1);
            fetchEquipments(1, pageSize, sortBy, order, val, selectedAssetId);
        }, 500);
    };

    const handleSortChange = (key, newOrder) => {
        setSortBy(key);
        setOrder(newOrder);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (row) => {
        try {
            const response = await axiosWrapper('api/v1/equipments/toggleEquipmentStatus', {
                method: 'POST',
                data: { id: row._id },
            });
            toast.success(response?.message || "Equipment deleted successfully");

            fetchEquipments(currentPage, pageSize, sortBy, order, search, selectedAssetId);
            // toast.success('Equipment status updated successfully');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update equipment status');
        }
    };

   const handleEdit = (equipment) => {
    navigate(`/edit-equipment/${equipment._id}`, { state: { equipment } });
  };

    const handleDelete = async (row) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to permanently delete this equipment?');
            if (!confirmDelete) return;

            const response = await axiosWrapper('api/v1/equipments/deleteEquipment', {
                method: 'POST',
                data: { equipmentId: row._id },
            });
            toast.success(response?.message || "Equipment deleted successfully");
            fetchEquipments(currentPage, pageSize, sortBy, order, search, selectedAssetId);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete equipment');
        }
    };

    const downloadExcel = async () => {
        if (!selectedAssetId) {
            toast.error('Please select an Asset Class first!');
            return;
        }

        try {
            console.log('Downloading Excel for asset:', selectedAssetId);
            const response = await axiosWrapper('api/v1/equipments/downloadExcel', {
                method: 'POST',
                data: { asset_id: selectedAssetId },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'equipments.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading Excel:', error);
            let errMsg = 'Failed to download Excel file';
            try {
                if (error?.response?.data instanceof Blob) {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    errMsg = json.message || errMsg;
                } else if (error?.response?.data?.message) {
                    errMsg = error.response.data.message;
                } else if (error?.message) {
                    errMsg = error.message;
                }
            } catch (parseErr) {
                console.error('Error parsing backend error:', parseErr);
            }
            toast.error(errMsg);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="tb-responsive assetbuilder-body position-relative">
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
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
                    <div className="d-flex gap-4">
                        <div className="dropdown" style={{ position: 'relative' }}>
                            <div
                                className={`form-select btn-bg1 d-flex justify-content-between align-items-center`}
                                style={{
                                    height: '40px',
                                    width: '240px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    padding: '10px',
                                }}
                                onClick={() => setIsOpen((prev) => !prev)}
                            >
                                <span className={selectedAssetName ? 'text-dark' : 'text-muted'}>
                                    {selectedAssetName || 'Select Asset Class'}
                                </span>
                                <span style={{ marginLeft: 'auto' }}>
                                    <i className={`bi bi-caret-${isOpen ? 'up' : 'down'}-fill`}></i>
                                </span>
                            </div>
                            {isOpen && (
                                <div
                                    ref={dropdownRef}
                                    className="dropdown-menu show"
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        marginTop: '2px',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        zIndex: 1000,
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <div style={{ padding: '5px' }} onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            ref={searchInputRef}
                                        />
                                    </div>
                                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                        <ul className="list-unstyled mb-0">
                                            {assets.length > 0 ? (
                                                assets.map((asset) => (
                                                    <li
                                                        key={asset.value}
                                                        onClick={() => {
                                                            setSelectedAssetId(asset.value);
                                                            setSelectedAssetName(asset.label);
                                                            setCurrentPage(1);
                                                            setIsOpen(false);
                                                        }}
                                                        className="px-3 py-2 dropdown-item"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {asset.label}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-3 py-2 text-muted">No results found</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        {selectedAssetId && (
                            <Button
                                name="Download"
                                onClick={downloadExcel}
                                icon="download-icon"
                                disabled={!selectedAssetId}
                            />
                        )}
                        <Button
                            name="ADD EQUIPMENT" icon={plusIcon}
                            onClick={() => navigate('/add_equipment')}
                        />
                    </div>
                </div>
                <Table
                    headers={headers}
                    rows={equipments.map((eq) => ({
                        ...eq,
                    }))}
                    sortBy={sortBy}
                    order={order}
                    onSortChange={handleSortChange}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
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