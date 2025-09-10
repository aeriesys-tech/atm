import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Table from "../../components/common/Table";
import Breadcrumb from "../../components/general/Breadcrum";
import Navbar from "../../components/general/Navbar";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import Search from "../../components/common/Search";
import search2 from "../../assets/icons/search2.svg";
import Modal from "../../components/common/Modal";
import lucide_download from "../../assets/icons/lucide_download.svg";
import close from "../../assets/icons/close.svg";
import { toast } from "react-toastify";
import plusIcon from "../../../src/assets/icons/plus1.svg"

const MasterDetail = () => {
  const { masterId } = useParams();

  const [data, setData] = useState([]);
  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [errorrowMessages, setErrorrowMessages] = useState(""); // if needed
  const fileInputRef = useRef(null);
  const selectedTemplateId = masterId;

  const debounceTimeoutRef = useRef(null);
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;
    setFormValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  //     try {
  //         setLoading(true);

  //         const response = await axiosWrapper(
  //             `api/v1/masters/dynamic-data/paginate?page=${currentPage}&limit=${pageSize}&sortBy=${sortBy}&order=${order}`,
  //             {
  //                 method: "POST",
  //                 data: {
  //                     masterId,
  //                     search: searchVal,
  //                     status: statusVal,
  //                 },
  //             }
  //         );

  //         const {
  //             master: masterData,
  //             data: dataRows,
  //             currentPage: resPage,
  //             totalPages,
  //             totalItems,
  //         } = response;

  //         setMaster(masterData);
  //         setData(dataRows);
  //         setCurrentPage(resPage);
  //         setTotalItems(totalItems);
  //         setTotalPages(totalPages);
  //     } catch (error) {
  //         console.error("Error fetching master detail:", error.message || error);
  //     } finally {
  //         setLoading(false);
  //     }
  // };
  const fetchMasterData = async (
    searchVal = search,
    statusVal = statusFilter
  ) => {
    try {
      setLoading(true);

      const response = await axiosWrapper(
        `api/v1/masters/dynamic-data/paginate?page=${currentPage}&limit=${pageSize}&sortBy=${sortBy}&order=${order}`,
        {
          method: "POST",
          data: {
            masterId,
            search: searchVal,
            status: statusVal,
          },
        }
      );
      const {
        master,
        data: dataRows,
        currentPage: resPage,
        totalPages,
      } = response.data;
      setMaster(response);
      setData(response.data);
      setCurrentPage(resPage);
      setTotalItems(response?.data?.length);
      setTotalPages(Math.ceil(totalItems / pageSize));
    } catch (error) {
      // console.error("Error fetching master detail:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Configure", href: "#" },
    {
      label:
        master?.master?.parameter_type_id?.parameter_type_name || "Masters",
      href: "#",
    },
    { label: master?.master?.master_name || "Master", href: "#" },
  ];
  useEffect(() => {
    if (masterId) {
      fetchMasterData(search, statusFilter);
    }
  }, [masterId, currentPage, pageSize, sortBy, order, statusFilter]);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);

    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchMasterData(val, statusFilter);
    }, 500);
  };
  const handleSortChange = (key, newOrder) => {
    setSortBy(key);
    setOrder(newOrder);
    setCurrentPage(1);
  };
  const allKeys = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  ).filter(
    (key) =>
      ![
        "_id",
        "__v",
        "created_at",
        "updated_at",
        "deleted_at",
        "docId",
        "masterId",
        "index",
      ].includes(key)
  );
  const nonStatusKeys = allKeys.filter((key) => key !== "status");
  const hasStatus = allKeys.includes("status");
  const processedData = data.map((row, index) => {
    const filledRow = {
      index: index + 1,
      _id: row._id, // ✅ Add this line
    };

    [...nonStatusKeys, ...(hasStatus ? ["status"] : [])].forEach((key) => {
      filledRow[key] = row[key] !== undefined ? row[key] : "---";
    });

    return filledRow;
  });

  const headers =
    data?.length > 0
      ? [
          { label: "ID", key: "index", sortable: false },
          ...nonStatusKeys.map((key) => ({
            label: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            key,
            sortable: false,
          })),
          ...(hasStatus
            ? [
                {
                  label: "Status",
                  key: "status",
                  sortable: false,
                },
              ]
            : []),
          { label: "Actions", key: "action", sortable: false },
        ]
      : [];
  const handleAddMasterEntry = async (formValues, setErrors, onSuccess) => {
    try {
      const payload = {
        id: masterId, // required by backend as `id`
        ...formValues, // dynamic fields like name, code, etc.
      };

      const res = await axiosWrapper("api/v1/masters/masters/add", {
        method: "POST",
        data: payload,
      });
      toast.success(res?.message || "Master Added successfully", {
        autoClose: 3000,
      });
      // Success: refetch table & close modal
      fetchMasterData();
      onSuccess();
    } catch (error) {
      alert(error?.message?.message);
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors); // This will map to form field error messages
      }
    }
  };
  const handleDeleteDynamicField = async (row) => {
    try {
      setLoading(true);

      const response = await axiosWrapper(
        "api/v1/masters/masterfields-delete",
        {
          method: "POST",
          data: {
            masterId: masterId,
            docId: row._id,
          },
        }
      );
      toast.success(response?.message || "Master deleted successfully", {
        autoClose: 3000,
      });
      fetchMasterData(currentPage, pageSize);
    } catch (error) {
      // console.error("Failed to soft delete dynamic field:", error.message || error);
    } finally {
      setLoading(false);
    }
  };
  const handleEditClick = (row) => {
    setEditErrors({});
    setEditFormData(row);
    setEditModalOpen(true);
  };
  const handleUpdateSubmit = async (formData, setErrors, onSuccess) => {
    try {
      setLoading(true);

      const payload = {
        masterId: masterId, // Master ID
        docId: formData._id, // Document ID to update
        ...formData,
      };

      const response = await axiosWrapper("api/v1/masters/masters-update", {
        method: "POST",
        data: payload,
      });
      toast.success(response?.message || "Master deleted successfully", {
        autoClose: 3000,
      });
      onSuccess();
      fetchMasterData(); // Refresh the table
      setEditModalOpen(false);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({ general: "Unexpected error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleHardDeleteDynamicField = async (row) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this record?"
      )
    )
      return;

    try {
      setLoading(true);
      const response = await axiosWrapper("api/v1/masters/masters/destroy", {
        method: "POST",
        data: {
          masterId: masterId,
          docId: row._id,
        },
      });
      //   if (!window.confirm("Permanently deleted this record.")) return;
      toast.success(response?.message || "Master deleted successfully", {
        autoClose: 3000,
      });
      await fetchMasterData();
    } catch (error) {
      console.error("Hard delete failed:", error.message || error);
      alert("Failed to permanently delete. Check dependencies or server logs.");
    } finally {
      setLoading(false);
    }
  };
  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setErrorMessages([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };
  const downloadExcel = async (templateId) => {
    try {
      const response = await axiosWrapper(
        `api/v1/masters/download-empty-sheet`,
        {
          method: "POST",
          responseType: "blob", // Required!
          data: { masterId: templateId },
        },
        null,
        true // rawResponse: true
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `template-${templateId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download template.");
      // console.error(err);
    }
  };

  const uploadExcel = async (e, templateId) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessages(["Please select a file before uploading."]);
      return;
    }

    // Get the schemaDefinitionId from the master object
    const schemaDefinitionId = master?.master?.schemaDefinitionId;

    if (!schemaDefinitionId) {
      setErrorMessages(["schemaDefinitionId not found."]);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("masterId", schemaDefinitionId); // Send this instead of masterId

    try {
      setLoading(true);
      const response = await axiosWrapper(`api/v1/masters/upload-excel`, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload successful!");
      setShowUploadModal(false);
      fetchMasterData(); // Refresh data
    } catch (err) {
      // console.error(err);
      const errors = err?.response?.data?.errors || ["Upload failed"];
      setErrorMessages(errors);
    } finally {
      setLoading(false);
    }
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
        //  style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}
      >
        <Breadcrumb
          title={master?.master?.master_name || "Master"}
          items={breadcrumbItems}
        />
        {/* <h4 className="py-3">Master Detail: {master?.master_name || ""}</h4> */}
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
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button name="Bulk Upload" onClick={handleOpenUploadModal} />

            <Button
              name={`Add ${master?.master?.master_name || "Master"}`} icon={plusIcon}
              onClick={() => {
                setFormValues({});
                setFormErrors({});
                setShowModal(true);
              }}
            />
            {showModal && (
              <Modal
                title={`Add ${master?.master?.master_name || "Master"}`}
                onClose={() => setShowModal(false)}
                onSubmit={handleAddMasterEntry}
                fields={
                  master?.master?.masterFields?.map((field) => ({
                    label: field.display_name,
                    name: field.field_name,
                    type:
                      field.field_type.toLowerCase() === "number"
                        ? "number"
                        : "text",
                    required: field.required,
                  })) || []
                }
                values={formValues}
                setValues={setFormValues}
                errors={formErrors}
                setErrors={setFormErrors}
                onChange={handleInputChange}
                onSuccess={() => {
                  setShowModal(false);
                  setFormValues({});
                  setFormErrors({});
                }}
              />
            )}
            {showUploadModal && (
              <div
                className="modal-overlay"
                onClick={handleCloseUploadModal}
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
                    margin: "100px auto",
                    maxHeight: "calc(100vh - 120px)",
                    background: "#fff",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="addunit-header d-flex justify-content-between align-items-center">
                    <h4>Bulk Add Data</h4>
                    <a
                      onClick={handleCloseUploadModal}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={close} width="28px" height="28px" alt="Close" />
                    </a>
                  </div>

                  <form onSubmit={(e) => uploadExcel(e, selectedTemplateId)}>
                    <div
                      className="addunit-form px-4 pt-3 "
                      style={{ overflowY: "auto" }}
                    >
                      <label className="file" style={{ height: "50px" }}>
                        <input
                          type="file"
                          id="fileInput"
                          ref={fileInputRef}
                          aria-label="File browser"
                          onChange={handleFileChange}
                        />
                        <span className="file-custom" id="fileName">
                          {selectedFile ? selectedFile.name : "No file chosen"}{" "}
                        </span>
                      </label>

                      {errorrowMessages && (
                        <div
                          style={{
                            color: "#dc3545",
                            marginTop: "10px",
                            paddingLeft: "10px",
                          }}
                        >
                          {errorrowMessages}
                        </div>
                      )}

                      {errorMessages.length > 0 && (
                        <div
                          style={{
                            color: "#dc3545",
                            paddingLeft: "10px",
                            marginTop: "10px",
                          }}
                        >
                          <ul>
                            {errorMessages.map((msg, index) => (
                              <li key={index}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p
                        style={{
                          fontSize: "14px",
                          color: "gray",
                          marginTop: "10px",
                        }}
                      >
                        Upload format can be XLS or CSV file.
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <button
                          type="button"
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            display: "flex",
                            alignItems: "center",
                          }}
                          onClick={() => downloadExcel(selectedTemplateId)}
                        >
                          <span style={{ fontSize: "16px" }}>
                            Download Template
                          </span>
                          <img
                            style={{ width: "25px", marginLeft: "8px" }}
                            src={lucide_download}
                            alt="Download"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="addunit-card-footer d-flex justify-content-end gap-2 px-4 pb-4">
                      <Button
                        name="Close"
                        className="discard-btn"
                        onClick={handleCloseUploadModal}
                      />
                      <Button
                        name="Upload"
                        className="update-btn"
                        type="submit"
                      />
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        <Table
          headers={headers}
          rows={processedData}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          onToggleStatus={handleDeleteDynamicField}
          onEdit={handleEditClick}
          onDelete={handleHardDeleteDynamicField}
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
            title={`Edit ${master?.master?.master_name || "Entry"}`}
            fields={
              master?.master?.masterFields?.map((field) => ({
                label: field.display_name,
                name: field.field_name,
                type:
                  field.field_type.toLowerCase() === "number"
                    ? "number"
                    : "text",
                required: field.required,
              })) || []
            }
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
            submitButtonLabel="Update"
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default MasterDetail;
