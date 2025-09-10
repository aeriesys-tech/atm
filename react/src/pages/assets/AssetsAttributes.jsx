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
import InputField from "../../components/common/InputField";
import closeIcon from "../../assets/icons/close.svg";

const AssetAttribute = () => {
  const { id: templateTypeId } = useParams();

  const [assetAttributes, setAssetAttributes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("field_name");
  const [order, setOrder] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    field_name: "",
    display_name: "",
    field_type: "",
    field_value: "",
    required: "false",
  });
  const [addErrors, setAddErrors] = useState({});

  const debounceTimeoutRef = useRef(null);

  const breadcrumbItems = [
    { label: "Assets", href: "#" },
    { label: "Assets Attributes", href: "#" },
  ];

  const headers = [
    { label: "#", key: "index", sortable: false },
    { label: "Field Name", key: "field_name", sortable: true },
    { label: "Display Name", key: "display_name", sortable: true },
    { label: "Field Type", key: "field_type", sortable: true },
    { label: "Field Value", key: "field_value", sortable: false },
    { label: "Required", key: "requiredDisplay", sortable: false },
    { label: "Status", key: "status", sortable: false },
    { label: "Action", key: "action", sortable: false },
  ];

  // Fetch asset attributes
  const fetchAssetAttributes = async (
    page = 1,
    limit = pageSize,
    sort = sortBy,
    sortOrder = order,
    status = statusFilter,
    searchText = search
  ) => {
    try {
      setLoading(true);

      const body = {
        page,
        limit,
        sortBy: sort,
        order: sortOrder,
      };

      if (status === "active") body.status = "true";
      else if (status === "inactive") body.status = "false";

      if (searchText?.trim()) body.search = searchText.trim();

      const response = await axiosWrapper(
        `api/v1/asset-attributes/paginateAssetAttributes`,
        { method: "POST", data: body }
      );

      const mapped = response?.assetAttributes?.map((asset, index) => ({
        _id: asset._id,
        index: index + 1 + (page - 1) * pageSize,
        field_name: asset.field_name,
        display_name: asset.display_name,
        field_type: asset.field_type,
        field_value:
          Array.isArray(asset.field_value) && asset.field_value.length > 0
            ? asset.field_value.map((v) => (v?.trim() ? v : "-")).join(", ")
            : "-",
        required: asset.required,
        requiredDisplay: asset.required ? "Yes" : "No",
        status: asset.status,
      }));

      setAssetAttributes(mapped);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching asset attributes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetAttributes(
      currentPage,
      pageSize,
      sortBy,
      order,
      statusFilter,
      search
    );
  }, [currentPage, pageSize, sortBy, order, statusFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);

    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAssetAttributes(1, pageSize, sortBy, order, statusFilter, val);
    }, 500);
  };

  // Fields for modal form
  const assetAttributeFields = [
    {
      label: "Field Name",
      name: "field_name",
      type: "text",
      placeholder: "Enter field name",
      required: true,
    },
    {
      label: "Field Type",
      name: "field_type",
      type: "dropdown",
      required: true,
      options: [
        { label: "String", value: "string" },
        { label: "Number", value: "number" },
        // { label: "Select", value: "select" },
        { label: "Date", value: "date" },
        { label: "Textarea", value: "textarea" },
      ],
    },
    {
      label: "Display Name",
      name: "display_name",
      type: "text",
      placeholder: "Enter display name",
      required: true,
    },

    {
      label: "Field Value",
      name: "field_value",
      type: "text",
      placeholder: "Field value is disabled",
      required: false,
      disabled: true,
    },
    {
      label: "Required",
      name: "required",
      type: "dropdown",
      required: true,
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ];

  // Create asset attribute
  const handleCreateAssetAttribute = async (formData, setErrors, onSuccess) => {
    try {
      setLoading(true);

      const payload = {
        field_name: formData.field_name,
        display_name: formData.display_name,
        field_type: formData.field_type,
        field_value:
          formData.field_type === "select" ? formData.field_value : "",
        required: formData.required === "true" || formData.required === true,
      };

      const response = await axiosWrapper(
        "api/v1/asset-attributes/createAssetAttribute",
        {
          method: "POST",
          data: payload,
        }
      );
      toast.success(
        response?.message || "Asset Attribute created successfully",
        {
          autoClose: 3000,
        }
      );
      onSuccess();
      fetchAssetAttributes();
    } catch (err) {
      toast.error(err?.message?.message || "Failed to Asset Attribute", {
        autoClose: 3000,
      });
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          field_name: apiErrors.field_name,
          display_name: apiErrors.display_name,
          field_type: apiErrors.field_type,
          field_value: apiErrors.field_value,
          required: apiErrors.required,
        });
      } else {
        setErrors({ field_name: "Unexpected error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit asset attribute
  const handleEditClick = (row) => {
    setEditErrors({});
    setEditFormData({
      id: row._id,
      field_name: row.field_name,
      display_name: row.display_name,
      field_type: row.field_type,
      field_value: row.field_value,
      required: String(row.required),
      status: row.status,
    });
    setEditModalOpen(true);
  };

  const handleUpdateSubmit = async (formData, setErrors, onSuccess) => {
    try {
      setLoading(true);

      const payload = {
        id: formData.id,
        field_name: formData.field_name,
        display_name: formData.display_name,
        field_type: formData.field_type,
        field_value:
          formData.field_type === "select" ? formData.field_value : "",
        required: formData.required === "true" || formData.required === true,
        status: formData.status ?? true,
      };

      const response = await axiosWrapper(
        "api/v1/asset-attributes/updateAssetAttribute",
        {
          method: "POST",
          data: payload,
        }
      );
      toast.success(
        response?.message || "Asset Attribute updated successfully",
        {
          autoClose: 3000,
        }
      );
      onSuccess();
      fetchAssetAttributes(currentPage, pageSize, sortBy, order, statusFilter);
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err?.message?.message || "Failed to Asset Attribute", {
        autoClose: 3000,
      });
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          field_name: apiErrors.field_name,
          display_name: apiErrors.display_name,
          field_type: apiErrors.field_type,
          field_value: apiErrors.field_value,
          required: apiErrors.required,
        });
      } else {
        setErrors({ field_name: "Unexpected error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (row) => {
    try {
      setLoading(true);
      await axiosWrapper("api/v1/asset-attributes/deleteAssetAttribute", {
        method: "POST",
        data: { id: row._id },
      });
      fetchAssetAttributes(currentPage, pageSize, sortBy, order, statusFilter);
    } catch (err) {
      alert(err?.message?.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete permanently
  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this asset attribute permanently?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await axiosWrapper("api/v1/asset-attributes/destroyAssetAttribute", {
        method: "POST",
        data: { id: row._id },
      });
      fetchAssetAttributes();
    } catch (error) {
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
      <div
        className="pt-3"
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <Breadcrumb title="Assets Attributes" items={breadcrumbItems} />

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
              name="Add Asset Attribute"
              onClick={() => {setAddErrors({})
                setAddModalOpen(true);}}
            />
          </div>
        </div>

        <Table
          headers={headers}
          rows={assetAttributes}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          onEdit={handleEditClick}
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

        {(addModalOpen || editModalOpen) && (
          <div
            className="modal-overlay"
            onClick={() => {
              setAddModalOpen(false);
              setEditModalOpen(false);
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9999,
              overflowY: "auto",
              paddingTop: "60px",
            }}
          >
            <div
              className="addunit-card"
              style={{
                width: "60%",
                marginTop: "240px",
                background: "#fff",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="addunit-header d-flex justify-content-between align-items-center p-3 border-bottom">
                <h4>
                  {editModalOpen
                    ? "Edit Asset Attribute"
                    : "Add Asset Attribute"}
                </h4>
                <a
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <img src={closeIcon} width="28px" height="28px" alt="Close" />
                </a>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editModalOpen) {
                    handleUpdateSubmit(editFormData, setEditErrors, () =>
                      setEditModalOpen(false)
                    );
                  } else {
                    handleCreateAssetAttribute(
                      addFormData,
                      setAddErrors,
                      () => {
                        setAddModalOpen(false);
                        setAddFormData({
                          field_name: "",
                          display_name: "",
                          field_type: "",
                          field_value: "",
                          required: "false",
                        });
                        setAddErrors({});
                      }
                    );
                  }
                }}
              >
                <div
                  className="addunit-form p-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {(editModalOpen
                    ? assetAttributeFields
                    : assetAttributeFields
                  ).map((field, idx) => (
                    <div key={idx}>
                      {field.type === "dropdown" ? (
                        <Dropdown
                          label={field.label}
                          options={field.options || []}
                          value={
                            editModalOpen
                              ? editFormData[field.name] || ""
                              : addFormData[field.name] || ""
                          }
                          name={field.name}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            if (editModalOpen) {
                              setEditFormData((prev) => ({
                                ...prev,
                                [name]: value,
                              }));
                            } else {
                              setAddFormData((prev) => ({
                                ...prev,
                                [name]: value,
                              }));
                            }
                          }}
                          error={
                            editModalOpen
                              ? editErrors[field.name]
                              : addErrors[field.name]
                          }
                        />
                      ) : (
                        <InputField
                          label={field.label}
                          type={field.type}
                          name={field.name}
                          id={field.name}
                          placeholder={field.placeholder}
                          value={
                            editModalOpen
                              ? editFormData[field.name] || ""
                              : addFormData[field.name] || ""
                          }
                          onChange={(e) => {
                            const { name, value } = e.target;
                            if (editModalOpen) {
                              setEditFormData((prev) => ({
                                ...prev,
                                [name]: value,
                              }));
                            } else {
                              setAddFormData((prev) => ({
                                ...prev,
                                [name]: value,
                              }));
                            }
                          }}
                          isRequired={field.required}
                          isNumeric={field.isNumeric}
                          maxLength={field.maxLength}
                          error={
                            editModalOpen
                              ? editErrors[field.name]
                              : addErrors[field.name]
                          }
                           disabled={field.disabled === true}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="addunit-card-footer mt-2 d-flex gap-2 p-3 border-top">
                  <Button
                    name="DISCARD"
                    className="discard-btn"
                    onClick={() => {
                      setAddModalOpen(false);
                      setEditModalOpen(false);
                    }}
                  />
                  <Button
                    name={editModalOpen ? "UPDATE" : "ADD"}
                    type="submit"
                    className="update-btn"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAttribute;
