import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
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
import axiosWrapper from "../../../services/AxiosWrapper";
import InputField from "../../components/common/InputField";
import Table from "../../components/common/Table";
import Select from "react-select";
import * as XLSX from 'xlsx'; // For parsing Excel files
import { toast } from "react-toastify";

const EditEquipment = () => {
    const { id: equipmentId } = useParams();
    const { state } = useLocation();
    const equipment = state?.equipment;
    const [assets, setAssets] = useState([]);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [selectedAssetName, setSelectedAssetName] = useState('');
    const [assetTemplates, setAssetTemplates] = useState([]);
    const [rows, setRows] = useState({});
    const [formFields, setFormFields] = useState({});
    const [selectedValues, setSelectedValues] = useState({});
    const [errors, setErrors] = useState({});
    const [editRowTemplateId, setEditRowTemplateId] = useState(null);
    const [editRowIndex, setEditRowIndex] = useState(null);
    const [editRowValues, setEditRowValues] = useState({});
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedTemplateCode, setSelectedTemplateCode] = useState('');
    const [modalValues, setModalValues] = useState({ file: null });
    const [modalErrors, setModalErrors] = useState({});
    const [groupedItems, setGroupedItems] = useState([]);
    const [masterOptionsMap, setMasterOptionsMap] = useState({});
    const [templateLeafNodes, setTemplateLeafNodes] = useState({});
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    const breadcrumbItems = [
        { label: 'My Assets', href: '/myassets' },
        { label: 'All Assets', href: '/all_assets' },
        { label: 'Edit Equipment', href: '#' },
    ];

    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            height: '38px',
            borderRadius: '4px',
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0 8px',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#495057',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    useEffect(() => {
        const fetchAssetClasses = async () => {
            try {
                setLoading(true);
                const response = await axiosWrapper('api/v1/assets/getAssets', {
                    method: 'POST',
                });
                const rawAssets = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                    ? response.data
                    : [];
                const options = rawAssets.map((a) => ({
                    label: a.asset_name,
                    value: a._id,
                }));
                setAssets(options);

                // If equipment data is passed, set asset and fetch data
                if (equipment && equipment.asset_id) {
                    const asset = options.find((a) => a.value === equipment.asset_id);
                    if (asset) {
                        setSelectedAssetId(asset.value);
                        setSelectedAssetName(asset.label);
                        handleAssetClassSelect(asset, equipment);
                    } else {
                        // Fetch asset name if not found in initial response
                        try {
                            const assetResponse = await axiosWrapper('api/v1/assets/getAssetById', {
                                method: 'POST',
                                data: { assetId: equipment.asset_id },
                            });
                            const assetData = assetResponse?.data;
                            if (assetData && assetData.asset_name) {
                                setSelectedAssetId(equipment.asset_id);
                                setSelectedAssetName(assetData.asset_name);
                                handleAssetClassSelect(
                                    { value: equipment.asset_id, label: assetData.asset_name },
                                    equipment
                                );
                            } else {
                                toast.error('Asset class not found');
                                navigate('/all_assets');
                            }
                        } catch (error) {
                            console.error('Error fetching asset by ID:', error);
                            toast.error('Failed to fetch asset details');
                            navigate('/all_assets');
                        }
                    }
                } else {
                    toast.error('No equipment data provided');
                    navigate('/all_assets');
                }
            } catch (error) {
                console.error('Error fetching asset classes:', error);
                toast.error('Failed to fetch asset classes');
                navigate('/all_assets');
            } finally {
                setLoading(false);
            }
        };
        fetchAssetClasses();
    }, [equipment, navigate]);

    const handleAssetClassSelect = async (asset, equipment = null) => {
        setSelectedAssetId(asset.value);
        setSelectedAssetName(asset.label);
        setIsOpen(false);
        setGroupedItems([]);
        setRows({});
        setFormFields({});
        setSelectedValues({});
        setErrors({});
        setShowUploadModal(false);
        setAssetTemplates([]);
        setMasterOptionsMap({});
        setTemplateLeafNodes({});

        try {
            setLoading(true);
            const attributeResponse = await axiosWrapper('api/v1/asset-class-attributes/getAssetClassAttribute', {
                method: 'POST',
                data: { assetId: asset.value },
            });
            const attributes = Array.isArray(attributeResponse?.asset_attributes)
                ? attributeResponse.asset_attributes
                : [];
            const grouped = [];
            for (let i = 0; i < attributes.length; i += 2) {
                grouped.push(attributes.slice(i, i + 2));
            }
            setGroupedItems(grouped);

            const templateResponse = await axiosWrapper('api/v1/asset-masters/assetTemplateAttributes', {
                method: 'POST',
                data: { asset_id: asset.value },
            });
            const templates = Array.isArray(templateResponse)
                ? templateResponse
                : Array.isArray(templateResponse?.data)
                ? templateResponse.data
                : [];

            const masterResponse = await axiosWrapper('api/v1/asset-masters/getAssetClassMasters', {
                method: 'POST',
                data: { asset_id: asset.value },
            });
            const assetMasters = Array.isArray(masterResponse?.data?.assetMasters)
                ? masterResponse.data.assetMasters
                : [];

            const processedTemplates = await Promise.all(
                templates.map(async (template) => {
                    try {
                        const leafGroupResponse = await axiosWrapper('api/v1/template-masters/leafGroup', {
                            method: 'POST',
                            data: {
                                template_id: template._id,
                                asset_id: asset.value,
                            },
                        });
                        const leafNodes = Array.isArray(leafGroupResponse?.leaf_nodes)
                            ? leafGroupResponse.leaf_nodes
                            : [];
                        setTemplateLeafNodes((prev) => ({
                            ...prev,
                            [template._id]: leafNodes,
                        }));

                        const compositePathFields = new Set();
                        leafNodes.forEach((node) => {
                            if (node.heading_name.includes('-')) {
                                node.heading_name.split('-').forEach((part) => compositePathFields.add(part));
                            }
                        });

                        const attrs = leafNodes.map((node) => {
                            let options = [];
                            if (node.heading_name.includes('-')) {
                                const parts = node.heading_name.split('-');
                                options = assetMasters
                                    .filter((master) => parts.every((part) => master[part]))
                                    .map((master) => ({
                                        value: master._id,
                                        label: master.document_code,
                                    }));
                            } else {
                                const terminal = node.node_label;
                                options = assetMasters
                                    .filter((master) =>
                                        master[terminal] && Array.from(compositePathFields).every((part) => !master[part])
                                    )
                                    .map((master) => ({
                                        value: master._id,
                                        label: master.document_code,
                                    }));
                            }
                            setMasterOptionsMap((prev) => ({
                                ...prev,
                                [node.node_id]: options,
                            }));
                            return {
                                _id: node.node_id,
                                display_name: node.heading_name,
                                template_master_code: node.template_master_code,
                                field_type: 'select',
                            };
                        });
                        return { ...template, attributes: attrs };
                    } catch (error) {
                        console.error(`Error fetching leafGroup for template ${template._id}:`, error);
                        return { ...template, attributes: [] };
                    }
                })
            );
            setAssetTemplates(processedTemplates);

            if (equipment) {
                // Prefill form fields
                const ff = {};
                attributes.forEach((attr) => {
                    const key = attr.display_name;
                    if (equipment.hasOwnProperty(key)) {
                        ff[attr._id] = { value: equipment[key], label: attr.display_name };
                    }
                });
                setFormFields(ff);

                // Prefill rows
                let templatesData = equipment.templates;
                if (!Array.isArray(templatesData)) {
                    templatesData = [templatesData];
                }
                const rowsData = {};
                templatesData.forEach((t) => {
                    rowsData[t.template_id] = t.rows.map((row) => ({ ...row }));
                });
                setRows(rowsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error?.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const renderFormField = (attribute) => {
        return (
            <div className="col-sm-6" key={attribute._id}>
                <InputField
                    label={attribute.display_name}
                    type={attribute.field_type}
                    name={attribute._id}
                    id={attribute._id}
                    value={formFields[attribute._id]?.value || ''}
                    onChange={(e) =>
                        setFormFields((prev) => ({
                            ...prev,
                            [attribute._id]: { value: e.target.value, label: attribute.display_name },
                        }))
                    }
                    placeholder={`Enter ${attribute.display_name}`}
                    isRequired={true}
                />
                {errors[attribute._id] && (
                    <div className="error" style={{ color: '#dc3545' }}>
                        {errors[attribute._id]}
                    </div>
                )}
            </div>
        );
    };

    const handleAttributeChange = (templateId, attributeId, selectedOption) => {
        setSelectedValues((prev) => ({
            ...prev,
            [templateId]: {
                ...prev[templateId],
                [attributeId]: selectedOption ? { value: selectedOption.value, label: selectedOption.label } : null,
            },
        }));
    };

    const handleAddRowWithSelections = (templateId, assetTemplate) => {
        const newRow = {};
        let hasSelections = false;
        const newErrors = {};

        assetTemplate.attributes.forEach((attr) => {
            const selection = selectedValues[templateId]?.[attr._id];
            if (selection && selection.value) {
                newRow[attr._id] = { value: selection.value, label: selection.label };
                hasSelections = true;
            } else {
                newRow[attr._id] = { value: '', label: '' };
                newErrors[attr._id] = 'Required';
            }
        });

        if (!hasSelections) {
            setErrors((prev) => ({ ...prev, [templateId]: newErrors }));
            toast.error('Please select at least one value before adding a row.');
            return;
        }

        setRows((prev) => ({
            ...prev,
            [templateId]: [...(prev[templateId] || []), newRow],
        }));

        setSelectedValues((prev) => ({ ...prev, [templateId]: {} }));
        setErrors((prev) => ({ ...prev, [templateId]: {} }));
    };

    const handleEditInputChange = (attributeId, selectedOption) => {
        setEditRowValues((prev) => ({
            ...prev,
            [attributeId]: selectedOption ? { value: selectedOption.value, label: selectedOption.label } : { value: '', label: '' },
        }));
    };

    const handleEditClick = (templateId, rowIndex, assetTemplate) => {
        setEditRowTemplateId(templateId);
        setEditRowIndex(rowIndex);
        const row = rows[templateId][rowIndex];
        setEditRowValues(row);
    };

    const handleSaveClick = (templateId, e) => {
        e.preventDefault();
        const newErrors = {};
        let hasEmptyFields = false;

        Object.keys(editRowValues).forEach((key) => {
            if (!editRowValues[key].value) {
                newErrors[key] = 'Required';
                hasEmptyFields = true;
            }
        });

        if (hasEmptyFields) {
            setErrors((prev) => ({ ...prev, [templateId]: newErrors }));
            toast.error('All fields must be selected.');
            return;
        }

        setRows((prev) => {
            const updatedRows = [...(prev[templateId] || [])];
            updatedRows[editRowIndex] = editRowValues;
            return { ...prev, [templateId]: updatedRows };
        });
        setEditRowTemplateId(null);
        setEditRowIndex(null);
        setEditRowValues({});
        setErrors((prev) => ({ ...prev, [templateId]: {} }));
    };

    const handleDeleteClick = (e, templateId, rowIndex) => {
        e.preventDefault();
        setRows((prev) => {
            const updatedRows = [...(prev[templateId] || [])];
            updatedRows.splice(rowIndex, 1);
            return { ...prev, [templateId]: updatedRows };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formFieldErrors = {};
        groupedItems.flat().forEach((attr) => {
            if (!formFields[attr._id]?.value) {
                formFieldErrors[attr._id] = 'Required';
            }
        });

        const tableErrors = {};
        assetTemplates.forEach((template) => {
            if (!rows[template._id] || rows[template._id].length === 0) {
                tableErrors[template._id] = { general: 'At least one row is required for each template.' };
            }
        });

        if (Object.keys(formFieldErrors).length > 0 || Object.keys(tableErrors).length > 0) {
            setErrors({ ...formFieldErrors, ...tableErrors });
            toast.error('Please fill in all required fields and add at least one row per template.');
            return;
        }

        const payload = {
            equipmentId,
            asset_id: selectedAssetId,
            attributes: Object.keys(formFields).reduce((acc, key) => {
                acc[key] = formFields[key].value;
                return acc;
            }, {}),
            templates: assetTemplates.map((template) => ({
                template_id: template._id,
                rows: rows[template._id]?.map((row) => ({
                    ...row,
                })) || [],
            })),
        };

        try {
            setLoading(true);
            const response = await axiosWrapper('api/v1/equipments/updateEquipment', {
                method: 'POST',
                data: payload,
            });
            toast.success('Equipment updated successfully');
            console.log('Equipment updated:', response);
            navigate('/all_assets');
        } catch (error) {
            console.error('Error updating equipment:', error);
            toast.error(error?.response?.data?.message || 'Failed to update equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenuploadModal = (templateId, templateCode) => {
        setShowUploadModal(true);
        setSelectedTemplateId(templateId || '');
        setSelectedTemplateCode(templateCode || '');
        setModalValues({ file: null });
        setModalErrors({});
    };

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
        setModalValues({ file: null });
        setModalErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setModalValues((prev) => ({ ...prev, file }));
        setModalErrors((prev) => ({ ...prev, file: '' }));
    };

    const downloadExcel = async () => {
        if (!selectedAssetId) {
            toast.error('Please select an Asset Class first!');
            return;
        }

        if (!assetTemplates.length || !selectedTemplateId) {
            toast.error('No template selected or available for the asset!');
            return;
        }

        try {
            const response = await axiosWrapper('api/v1/equipments/downloadEmptySheet', {
                method: 'POST',
                data: { templateId: selectedTemplateId },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Template-${selectedTemplateId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Excel template downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            let errMsg = 'Failed to download Excel template';
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

    const uploadExcel = async (e, templateId) => {
        e.preventDefault();
        if (!modalValues.file) {
            setModalErrors({ file: 'Please select a file to upload.' });
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets['Leaf Master Fields'];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const headers = json[0] || [];
                const dataRows = json.slice(1) || [];
                const leafNodes = templateLeafNodes[templateId] || [];
                const newRows = [];
                for (const dataRow of dataRows) {
                    const newRow = {};
                    headers.forEach((header, index) => {
                        const value = dataRow[index] || '';
                        const leafNode = leafNodes.find((node) => node.node_label === header || node.heading_name === header);
                        if (leafNode) {
                            const node_id = leafNode.node_id;
                            const options = masterOptionsMap[node_id] || [];
                            const option = options.find((opt) => opt.label === value);
                            const value_id = option ? option.value : value;
                            newRow[node_id] = { value: value_id, label: value };
                        }
                    });
                    if (Object.keys(newRow).length > 0) {
                        newRows.push(newRow);
                    }
                }
                setRows((prev) => ({
                    ...prev,
                    [templateId]: [...(prev[templateId] || []), ...newRows],
                }));
                toast.success(`Successfully added ${newRows.length} rows to the table.`);
                handleCloseUploadModal();
            };
            reader.readAsArrayBuffer(modalValues.file);
        } catch (error) {
            console.error('Error uploading Excel:', error);
            let errMsg = error?.response?.data?.message || 'Failed to upload file';
            if (Array.isArray(error?.response?.data?.errors)) {
                errMsg = error.response.data.errors;
            }
            setModalErrors({ file: errMsg });
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

    const modalFields = [
        {
            label: 'Upload Excel/CSV',
            type: 'file',
            name: 'file',
            placeholder: 'No file chosen',
            accept: '.xls,.xlsx,.csv',
        },
    ];

    return (
       <div className="tb-responsive assetbuilder-body position-relative">
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3 pb-0 d-flex justify-content-between" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                <div>
                    <Breadcrumb title="Edit Equipment" items={breadcrumbItems} />
                </div>
                <div className="dropdown" style={{ position: 'relative' }}>
                    <div
                        className={`form-select btn-bg1 d-flex justify-content-between align-items-center`}
                        style={{
                            height: '40px',
                            width: '240px',
                            borderRadius: '12px',
                            cursor: 'not-allowed',
                        }}
                    >
                        <span className={selectedAssetName ? 'text-dark' : 'text-muted'}>
                            {selectedAssetName || 'Select Asset Class'}
                        </span>
                        <span style={{ marginLeft: 'auto' }}>
                            <i className="bi bi-caret-down-fill"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div className="addEuipment">
                <div>
                    <div className="addEuipment-header">
                        <h4>Edit Equipment</h4>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="addEuipment-form">
                            {Array.isArray(groupedItems) && groupedItems.length > 0 ? (
                                groupedItems.map((group, index) => (
                                    <div className="row" key={index}>
                                        {group.map((attribute) => renderFormField(attribute))}
                                        {group.length === 1 && <div className="d-flex"></div>}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted">No asset attributes available.</div>
                            )}
                            {assetTemplates?.map((assetTemplate, i) => (
                                <div className="row mb-4" key={i}>
                                    <div className="d-flex justify-content-between align-items-center col-sm-12 mb-n2">
                                        <div>{assetTemplate.template_code} Template</div>
                                        <div>
                                            <button
                                                type="button"
                                                id="openPopup"
                                                className="btn-bg text-capitalize"
                                                onClick={() => handleOpenuploadModal(assetTemplate._id, assetTemplate.template_code)}
                                            >
                                                Bulk Upload
                                            </button>
                                        </div>
                                    </div>
                                    <div className="asset-table">
                                        <div className="table-responsive mt-3">
                                            <table className="table table-striped align-middle table-text">
                                                <thead className="table-head align-middle">
                                                    <tr>
                                                        <th className="text-center">#</th>
                                                        {assetTemplate.attributes.map((attribute, j) => (
                                                            <th className="text-uppercase" key={j}>
                                                                {attribute.display_name}
                                                            </th>
                                                        ))}
                                                        <th className="text-center text-uppercase">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {errors[assetTemplate._id]?.general && (
                                                        <tr>
                                                            <td colSpan="100%" className="text-center">
                                                                <div className="error" style={{ color: '#dc3545' }}>
                                                                    {errors[assetTemplate._id].general}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr className={`row-${assetTemplate._id}`}>
                                                        <td className="text-center">#</td>
                                                        {assetTemplate.attributes.map((attribute, j) => (
                                                            <td key={j}>
                                                                <Select
                                                                    options={masterOptionsMap[attribute._id] || []}
                                                                    value={selectedValues[assetTemplate._id]?.[attribute._id] || null}
                                                                    onChange={(option) => handleAttributeChange(assetTemplate._id, attribute._id, option)}
                                                                    placeholder={`Select ${attribute.display_name}`}
                                                                    styles={customStyles}
                                                                    isClearable
                                                                />
                                                                {errors[assetTemplate._id]?.[attribute._id] && (
                                                                    <div className="error" style={{ color: '#dc3545' }}>
                                                                        {errors[assetTemplate._id][attribute._id]}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="text-center">
                                                            <button
                                                                style={{ width: '150px' }}
                                                                type="button"
                                                                onClick={() => handleAddRowWithSelections(assetTemplate._id, assetTemplate)}
                                                                className="btn-bg"
                                                            >
                                                                <span className="plus-icon">
                                                                    <img src={plus1} alt="Plus Icon" />
                                                                </span>
                                                                Add
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {rows[assetTemplate._id]?.map((row, rowIndex) => (
                                                        <tr key={rowIndex} className={`row-${assetTemplate._id}`}>
                                                            <td className="text-center">{rowIndex + 1}</td>
                                                            {assetTemplate.attributes.map((attribute, colIndex) => (
                                                                <td key={colIndex}>
                                                                    {editRowTemplateId === assetTemplate._id && editRowIndex === rowIndex ? (
                                                                        <Select
                                                                            options={masterOptionsMap[attribute._id] || []}
                                                                            value={
                                                                                editRowValues[attribute._id]
                                                                                    ? { value: editRowValues[attribute._id].value, label: editRowValues[attribute._id].label }
                                                                                    : null
                                                                            }
                                                                            onChange={(option) => handleEditInputChange(attribute._id, option)}
                                                                            placeholder={`Select ${attribute.display_name}`}
                                                                            styles={customStyles}
                                                                            isClearable
                                                                        />
                                                                    ) : (
                                                                        row[attribute._id]?.label || row[attribute._id]?.value || ''
                                                                    )}
                                                                    {errors[assetTemplate._id]?.[attribute._id] && (
                                                                        <div className="error" style={{ color: '#dc3545' }}>
                                                                            {errors[assetTemplate._id][attribute._id]}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            ))}
                                                            <td className="text-center">
                                                                {editRowTemplateId === assetTemplate._id && editRowIndex === rowIndex ? (
                                                                    <button
                                                                        style={{ width: '150px' }}
                                                                        type="button"
                                                                        onClick={(e) => handleSaveClick(assetTemplate._id, e)}
                                                                        className="addEuipment-update-btn"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            style={{ border: 'none', background: 'transparent' }}
                                                                            className="align-content-center me-3 mt-1"
                                                                            onClick={() => handleEditClick(assetTemplate._id, rowIndex, assetTemplate)}
                                                                        >
                                                                            <img style={{ width: '25px' }} src={edit} alt="edit" />
                                                                        </button>
                                                                        <button
                                                                            style={{ border: 'none', background: 'transparent' }}
                                                                            className="align-content-center me-3 mt-1"
                                                                            onClick={(e) => handleDeleteClick(e, assetTemplate._id, rowIndex)}
                                                                        >
                                                                            <img style={{ width: '25px' }} src={trash} alt="delete" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!rows[assetTemplate._id] || rows[assetTemplate._id].length === 0) && (
                                                        <tr>
                                                            <td colSpan="100%" className="text-center">
                                                                <p style={{ color: '#dc3545' }}>No data available.</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="addEuipment-footer d-flex gap-3 justify-content-center">
                            <Button
                                name="Discard"
                                className="addEuipment-discard-btn"
                                onClick={() => navigate('/all_assets')}
                            />
                            <Button
                                name="Update"
                                className="addEuipment-update-btn"
                                onClick={handleSubmit}
                            />
                        </div>
                    </form>
                </div>
            </div>
            {showUploadModal && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        overflowY: 'auto',
                        paddingTop: '60px',
                    }}
                >
                    <div
                        className="addunit-card"
                        style={{
                            width: '60%',
                            maxHeight: 'calc(100vh - 120px)',
                            background: '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="addunit-header">
                            <h4>Bulk Add Data for {selectedTemplateCode}</h4>
                            <button
                                style={{ border: 'none', backgroundColor: 'inherit' }}
                                type="button"
                                className="close"
                                onClick={handleCloseUploadModal}
                            >
                                <img src={close} width="28px" height="28px" alt="Close" />
                            </button>
                        </div>
                        <form autoComplete="off">
                            <div className="addunit-form">
                                <div className="mb-5">
                                    <div className="d-flex justify-content-between">
                                        <p className="addunit-form-text"></p>
                                        <div className="d-flex justify-content-between">
                                            <button
                                                type="button"
                                                style={{
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                                className="align-content-center me-3 mt-1"
                                                onClick={() => downloadExcel()}
                                            >
                                                <p className="addunit-form-text mt-3 mb-3">Download Template</p>
                                                <img style={{ width: '25px', marginLeft: '8px' }} src={lucide_download} alt="Download" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="file" style={{ height: '50px' }}>
                                            <input
                                                type="file"
                                                id="fileInput"
                                                ref={fileInputRef}
                                                aria-label="File browser example"
                                                onChange={handleFileChange}
                                                accept=".xls,.xlsx,.csv"
                                            />
                                            <span className="file-custom" id="fileName">
                                                {modalValues?.file ? modalValues.file.name : 'No file chosen'}
                                            </span>
                                        </label>
                                        {(modalErrors?.file || modalErrors?.length > 0) && (
                                            <div
                                                style={{
                                                    color: '#dc3545',
                                                    width: '450px',
                                                    paddingLeft: '10px',
                                                    marginTop: '10px',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                {modalErrors?.file && <p>{modalErrors.file}</p>}
                                                {modalErrors?.length > 0 && (
                                                    <ul>
                                                        {modalErrors.map((msg, index) => (
                                                            <li key={index}>{msg}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                        <p className="mx-2 mt-0" style={{ fontSize: '15px', color: 'gray', paddingBottom: '0px' }}>
                                            Upload format can be XLS or CSV file
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="addunit-card-footer justify-content-between">
                                <button type="button" className="discard-btn" onClick={handleCloseUploadModal}>
                                    Close
                                </button>
                                <button id="openPopup" className="update-btn" onClick={(e) => uploadExcel(e, selectedTemplateId)}>
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

export default EditEquipment;