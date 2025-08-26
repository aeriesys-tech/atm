import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../../components/general/LoaderAndSpinner/Loader";
import Breadcrumb from "../../components/general/Breadcrum";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import plus1 from "../../assets/icons/plus1.svg";
import edit from "../../assets/icons/edit.svg"; // Adjust path as needed
import trash from "../../assets/icons/trash.svg"; // Adjust path as needed
import close from "../../assets/icons/close.svg"; // Adjust path as needed
import lucide_download from "../../assets/icons/lucide_download.svg"; // Adjust path as needed
const AddEquipment = () => {
    const [assets, setAssets] = useState([]); // Asset classes for dropdown
    const [selectedAssetId, setSelectedAssetId] = useState("");
    const [selectedAssetName, setSelectedAssetName] = useState("");
    const [assetTemplates, setAssetTemplates] = useState([]);
    const [templateMasters, setTemplateMasters] = useState({});
    const [masterOptionsMap, setMasterOptionsMap] = useState({});
    const [groupedItems, setGroupedItems] = useState([]);
    const [rows, setRows] = useState({});
    const [errors, setErrors] = useState({});
    const [editRowTemplateId, setEditRowTemplateId] = useState(null);
    const [editRowIndex, setEditRowIndex] = useState(null);
    const [editRowValues, setEditRowValues] = useState({});
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [selectedTemplateCode, setSelectedTemplateCode] = useState("");
    const [modalValues, setModalValues] = useState({ file: null });
    const [modalErrors, setModalErrors] = useState({});
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "My Assets", href: "/myassets" },
        { label: "All Assets", href: "/all_assets" },
        { label: "Add Equipment", href: "#" },
    ];

    // Hardcoded asset options (replace with API call if needed)
    const assetOptions = [
        { label: "Asset Class 1", value: "asset1" },
        { label: "Asset Class 2", value: "asset2" },
        { label: "Asset Class 3", value: "asset3" },
        { label: "Asset Class 4", value: "asset4" },
    ];

    // Placeholder customStyles for react-select (adjust as per your setup)
    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: "40px",
            borderRadius: "8px",
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    // Fetch asset classes (mocked for now, replace with API)
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setLoading(true);
                // Example API call: const response = await axiosWrapper("api/v1/assets", { method: "GET" });
                setAssets(assetOptions); // Using hardcoded options
            } catch (error) {
                console.error("Error fetching assets:", error.message || error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    // Fetch templates and masters when asset class is selected
    useEffect(() => {
        if (selectedAssetId) {
            const fetchTemplatesAndMasters = async () => {
                try {
                    setLoading(true);
                    // Mock API response for templates
                    const templateResponse = await axiosWrapper(
                        `api/v1/templates?asset_id=${selectedAssetId}`,
                        { method: "GET" }
                    );
                    setAssetTemplates(templateResponse.templates || []);

                    // Mock API response for template masters
                    const mastersResponse = await axiosWrapper(
                        `api/v1/template_masters?asset_id=${selectedAssetId}`,
                        { method: "GET" }
                    );
                    const masters = mastersResponse.masters || [];
                    const mastersMap = {};
                    masters.forEach((master) => {
                        mastersMap[master.template_id] = mastersMap[master.template_id] || [];
                        mastersMap[master.template_id].push(master);
                    });
                    setTemplateMasters(mastersMap);

                    // Mock API response for master options
                    const optionsResponse = await axiosWrapper(
                        `api/v1/master_options?asset_id=${selectedAssetId}`,
                        { method: "GET" }
                    );
                    setMasterOptionsMap(optionsResponse.options || {});
                } catch (error) {
                    console.error("Error fetching templates/masters:", error.message || error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTemplatesAndMasters();
        }
    }, [selectedAssetId]);

    // Handle asset class selection
    const handleAssetClassChange = (value) => {
        const selectedAsset = assets.find((asset) => asset.value === value);
        setSelectedAssetId(value);
        setSelectedAssetName(selectedAsset ? selectedAsset.label : "");
        setGroupedItems([]); // Reset form fields
        setRows({}); // Reset table rows
        setErrors({});
        setShowUploadModal(false); // Close modal on asset change
    };

    // Render form fields (mocked, adjust based on your data structure)
    const renderFormField = (attribute) => {
        return (
            <div className="col-md-6 d-flex flex-column addEuipment-form-col" key={attribute._id}>
                <label>{attribute.display_name}</label>
                <input
                    type="text"
                    placeholder={`Enter ${attribute.display_name}`}
                    onChange={(e) => handleAttributeChange(null, attribute._id, e.target.value)}
                    className="form-control"
                />
            </div>
        );
    };

    // Handle attribute change in form
    const handleAttributeChange = (templateId, attributeId, value) => {
        console.log("Attribute changed:", { templateId, attributeId, value });
    };

    // Handle table row addition
    const handleAddClick = (templateId, assetTemplate) => {
        const newRow = {};
        assetTemplate.attributes.forEach((attr) => {
            newRow[attr._id] = { value: "" };
        });
        templateMasters[templateId]?.forEach((master) => {
            newRow[master.master_id] = { value: "", text: "" };
        });
        setRows((prev) => ({
            ...prev,
            [templateId]: [...(prev[templateId] || []), newRow],
        }));
    };

    // Handle table row edit
    const handleEditClick = (templateId, rowIndex, assetTemplate) => {
        setEditRowTemplateId(templateId);
        setEditRowIndex(rowIndex);
        const row = rows[templateId][rowIndex];
        setEditRowValues(row);
    };

    // Handle table row save
    const handleSaveClick = (templateId, e) => {
        e.preventDefault();
        setRows((prev) => {
            const updatedRows = [...(prev[templateId] || [])];
            updatedRows[editRowIndex] = editRowValues;
            return { ...prev, [templateId]: updatedRows };
        });
        setEditRowTemplateId(null);
        setEditRowIndex(null);
        setEditRowValues({});
    };

    // Handle table row deletion
    const handleDeleteClick = (e, templateId, rowIndex) => {
        e.preventDefault();
        setRows((prev) => {
            const updatedRows = [...(prev[templateId] || [])];
            updatedRows.splice(rowIndex, 1);
            return { ...prev, [templateId]: updatedRows };
        });
    };

    // Handle edit input change for table
    const handleEditInputChange = (key, selectedOption, isSelect) => {
        setEditRowValues((prev) => ({
            ...prev,
            [key]: isSelect
                ? { value: selectedOption?.value || "", label: selectedOption?.label || "" }
                : { value: selectedOption, label: selectedOption },
        }));
    };

    const handleEditInputChange1 = (key, value, isSelect) => {
        setEditRowValues((prev) => ({
            ...prev,
            [key]: isSelect
                ? { value: value?.value || "", label: value?.label || "" }
                : { value, label: value },
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", { selectedAssetId, rows });
        navigate("/all_assets");
    };

    // Handle bulk upload modal
    const handleOpenuploadModal = () => {
        console.log("Opening modal"); // Debug log
        setShowUploadModal(true);
        const firstTemplate = assetTemplates[0] || {};
        setSelectedTemplateId(firstTemplate._id || "");
        setSelectedTemplateCode(firstTemplate.template_code || "");
        setModalValues({ file: null });
        setModalErrors({});
    };

    const handleCloseUploadModal = () => {
        console.log("Closing modal"); // Debug log
        setShowUploadModal(false);
        setModalValues({ file: null });
        setModalErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setModalValues((prev) => ({ ...prev, file }));
        setModalErrors((prev) => ({ ...prev, file: "" }));
    };

    const downloadExcel = async (templateId) => {
        try {
            console.log("Downloading Excel template for:", templateId);
            // Implement download logic
            // await axiosWrapper(`api/v1/templates/export?template_id=${templateId}`, { method: "GET" });
        } catch (error) {
            console.error("Error downloading Excel:", error.message || error);
        }
    };

    const uploadExcel = (values, setErrors, onSuccess) => {
        if (!values.file) {
            setErrors({ file: "Please select a file to upload." });
            return;
        }
        try {
            console.log("Uploading Excel for:", selectedTemplateId, values.file);
            // Implement upload logic
            // await axiosWrapper(`api/v1/templates/upload?template_id=${selectedTemplateId}`, { method: "POST", data: values.file });
            onSuccess();
            handleCloseUploadModal();
        } catch (error) {
            setErrors({ file: error?.response?.data?.message || "Failed to upload file" });
        }
    };

    // Table headers for each asset template
    const getTableHeaders = (assetTemplate) => {
        const masterHeaders =
            templateMasters[assetTemplate._id]?.map((master) => ({
                label: master.heading_name || master.master_name,
                key: master.master_id,
                sortable: false,
            })) || [];
        const attributeHeaders = assetTemplate.attributes.map((attr) => ({
            label: attr.display_name,
            key: attr._id,
            sortable: false,
        }));
        return [
            { label: "#", key: "index", sortable: false },
            ...masterHeaders,
            ...attributeHeaders,
            { label: "Action", key: "action", sortable: false },
        ];
    };

    // Table rows for each asset template
    const getTableRows = (assetTemplate) => {
        return (
            rows[assetTemplate._id]?.map((row, rowIndex) => {
                const rowData = {
                    index: rowIndex + 1,
                    ...row,
                    action: (
                        <div className="d-flex gap-2">
                            {editRowTemplateId === assetTemplate._id && editRowIndex === rowIndex ? (
                                <Button
                                    name="Save"
                                    onClick={(e) => handleSaveClick(assetTemplate._id, e)}
                                    className="addEuipment-update-btn"
                                />
                            ) : (
                                <>
                                    <Button
                                        className="align-content-center me-3 mt-1"
                                        style={{ border: "none", background: "transparent" }}
                                        onClick={() => handleEditClick(assetTemplate._id, rowIndex, assetTemplate)}
                                        icon={<img style={{ width: "25px" }} src={edit} alt="edit" />}
                                    />
                                    <Button
                                        className="align-content-center me-3 mt-1"
                                        style={{ border: "none", background: "transparent" }}
                                        onClick={(e) => handleDeleteClick(e, assetTemplate._id, rowIndex)}
                                        icon={<img style={{ width: "25px" }} src={trash} alt="delete" />}
                                    />
                                </>
                            )}
                        </div>
                    ),
                };
                return rowData;
            }) || []
        );
    };

    // Modal fields for file upload
    const modalFields = [
        {
            label: "Upload Excel/CSV",
            type: "file",
            name: "file",
            placeholder: "No file chosen",
            accept: ".xls,.xlsx,.csv",
        },
    ];

    return (
        <div >
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3 pb-0 d-flex justify-content-between" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                <div>
                    <Breadcrumb title="Add Equipment" items={breadcrumbItems} />
                </div>
                <div className="dropdown" style={{ position: "relative", width: "200px" }}>
                    <Dropdown
                        label="Asset Class"
                        options={assets}
                        value={selectedAssetId}
                        onChange={(e) => handleAssetClassChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="addEuipment">
                <div>
                    <div className="addEuipment-header">
                        <h4>Add Equipment</h4>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="addEuipment-form">
                            {groupedItems.map((group, index) => (
                                <div className="row" key={index}>
                                    {group.map((attribute) => renderFormField(attribute))}
                                    {group.length === 1 && (
                                        <div className="col-md-6 d-flex flex-column addEuipment-form-col"></div>
                                    )}
                                </div>
                            ))}
                            {assetTemplates?.map((assetTemplate, i) => (
                                <div className="row mb-4" key={i}>
                                    <div className="d-flex justify-content-between align-items-center col-sm-12 mb-n2">
                                        <div>{assetTemplate.template_code} Template</div>
                                    </div>
                                    <div className="table-responsive" style={{ marginTop: "24px", borderRadius: "16px" }}>
                                        <Table
                                            headers={getTableHeaders(assetTemplate)}
                                            rows={getTableRows(assetTemplate)}
                                            noDataMessage="No data available."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                    <div className="addEuipment-footer d-flex gap-3 justify-content-center">

                        <Button
                            name="Discard"
                            className="addEuipment-discard-btn"
                            onClick={() => navigate("/all_assets")}
                        />
                        <Button
                            name="Submit"
                            onClick={handleSubmit}
                            className="addEuipment-update-btn"
                        />
                    </div>
                </div>
                <div className="addEuipment-footer d-flex gap-3 justify-content-end mt-3">
                    <Button
                        name="Bulk Upload"
                        className="btn-bg text-capitalize"
                        onClick={handleOpenuploadModal}
                    />
                </div>
            </div>
            {showUploadModal && (
                <div
                    className="modal-overlay"
                    // onClick={handleCloseUploadModal}
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
                    <div className="addunit-card "    style={{
                    width: "60%",
                    marginTop: "100px",
                    maxHeight: "calc(100vh - 120px)",
                    background: "#fff",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}>
                        {/* Header */}
                        <div className="addunit-header">
                            <h4>Bulk Add Data</h4>
                            <button
                                style={{ border: "none", backgroundColor: "inherit" }}
                                type="button"
                                className="close"
                                onClick={handleCloseUploadModal}
                            >
                                <img src={close} width="28px" height="28px" alt="Close" />
                            </button>
                        </div>

                        {/* Form */}
                        <form autoComplete="off">
                            <div className="addunit-form">
                                <div className="mb-5">
                                    <div className="d-flex justify-content-between">
                                        <p className="addunit-form-text"></p>

                                        {/* Download Template Button */}
                                        <div className="d-flex justify-content-between">
                                            <button
                                                type="button"
                                                style={{
                                                    border: "none",
                                                    backgroundColor: "transparent",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                                className="align-content-center me-3 mt-1"
                                                onClick={() => downloadExcel(selectedTemplateId)}
                                            >
                                                <p className="addunit-form-text mt-3 mb-3">
                                                    Download Template
                                                </p>
                                                <img
                                                    style={{ width: "25px", marginLeft: "8px" }}
                                                    src={lucide_download}
                                                    alt="Download"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className="file" style={{ height: "50px" }}>
                                            <input
                                                type="file"
                                                id="fileInput"
                                                ref={fileInputRef}
                                                aria-label="File browser example"
                                                onChange={handleFileChange}
                                            />
                                            <span className="file-custom" id="fileName">
                                                {modalValues?.file ? modalValues.file.name : "No file chosen"}
                                            </span>
                                        </label>

                                        {/* Errors */}
                                        {(modalErrors?.file || modalErrors?.length > 0) && (
                                            <div
                                                style={{
                                                    color: "#dc3545",
                                                    width: "450px",
                                                    paddingLeft: "10px",
                                                    marginTop: "10px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                {modalErrors?.file && <p>{modalErrors.file}</p>}
                                                {modalErrors}
                                                {modalErrors?.length > 0 && (
                                                    <ul>
                                                        {modalErrors.map((msg, index) => (
                                                            <li key={index}>{msg}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}

                                        {/* Info text */}
                                        <p
                                            className="mx-2 mt-0"
                                            style={{ fontSize: "15px", color: "gray", paddingBottom: "0px" }}
                                        >
                                            Upload format can be XLS or CSV file
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="addunit-card-footer justify-content-between">
                                <button
                                    type="button"
                                    className="discard-btn"
                                    onClick={handleCloseUploadModal}
                                >
                                    Close
                                </button>
                                <button
                                    id="openPopup"
                                    className="update-btn"
                                    onClick={(e) => uploadExcel(e, selectedTemplateId)}
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                    </div>
)}


                </div>
            );
};
            export default AddEquipment