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
import { toast } from "react-toastify";
import plusIcon from "../../../src/assets/icons/plus1.svg";

const AssetName = () => {
  const { id: assetTypeId } = useParams();
  const [assetTypes, setassetTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("asset_name");
  const [order, setOrder] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assetTypeDetails, setassetTypeDetails] = useState(null);

  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Assets ", href: "#" },
    {
      label: "Assets Class",
      href: "#",
    },
  ];

  const headers = [
    { label: "#", key: "index", sortable: false },
    { label: "Asset Name", key: "asset_name", sortable: true },
    { label: "Asset Code", key: "asset_code", sortable: true },
    { label: "Status", key: "status", sortable: false },
    { label: "Action", key: "action", sortable: false },
  ];

  const fetchassetTypes = async (
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

      if (assetTypeId) {
        params.append("asset_type_id", assetTypeId);
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
      }));
      setassetTypes(mapped);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotalItems(response.totalItems);
      setassetTypeDetails(response.assetType);
    } catch (error) {
      // console.error("Error fetching asset types:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchassetTypes(currentPage, pageSize, sortBy, order, statusFilter, search);
  }, [currentPage, pageSize, sortBy, order, statusFilter, , assetTypeId]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchassetTypes(1, pageSize, sortBy, order, statusFilter, val);
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
        data: {
          id: row._id, // 👈 send single ID
        },
      });
      toast.success(response?.message || "Asset deleted successfully", {
        autoClose: 3000,
      });
      fetchassetTypes(
        currentPage,
        pageSize,
        sortBy,
        order,
        statusFilter,
        search
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update asset status");
    }
  };

  const handleDelete = async (row) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to permanently delete this asset?"
      );
      if (!confirmDelete) return;

      const response = await axiosWrapper("api/v1/assets/destroyasset", {
        method: "POST",
        data: { id: row._id },
      });
      toast.success(response?.message || "Asset deleted successfully", {
        autoClose: 3000,
      });
      fetchassetTypes();
    } catch (error) {
      // console.error("Failed to delete asset:", error.message || error);
      alert(error?.message?.message);
    }
  };

  return (
  <div className="tb-responsive assetbuilder-body position-relative">
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
      <div
        className="pt-3"
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <Breadcrumb title={"Assets Class"} items={breadcrumbItems} />
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
              searchable={false}
              value={statusFilter}
              options={[
                { label: "All", value: "" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button
              name="CREATE NEW ASSET CLASS"
              icon={plusIcon}
              onClick={() =>
                navigate("/asset_add", {
                  state: {
                    assetTypeId: assetTypeId,
                    assetTypeName: assetTypeDetails?.asset_type_name,
                  },
                })
              }
            />
          </div>
        </div>

        <Table
          headers={headers}
          rows={assetTypes}
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
                assetTypeId: assetTypeId,
                assetTypeName: assetTypeDetails?.asset_type_name,
              },
            })
          }
          onViewTemplate={(row) =>
            navigate(`/asset/view/${row._id}`, {
              state: {
                assetCode: row.asset_code,
                assetName: row.asset_name,
                structure: row.structure,
                assetTypeId: assetTypeId,
                assetTypeName: assetTypeDetails?.asset_type_name,
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

export default AssetName;
