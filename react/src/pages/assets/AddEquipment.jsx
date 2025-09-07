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
import axiosWrapper from "../../../services/AxiosWrapper";
import InputField from "../../components/common/InputField";
import Table from "../../components/common/Table";
import Select from "react-select";

const AddEquipment = () => {
    const [assets, setAssets] = useState([]);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [selectedAssetName, setSelectedAssetName] = useState('');
    const [assetTemplates, setAssetTemplates] = useState([]);
    const [rows, setRows] = useState({}); // For table rows
    const [formFields, setFormFields] = useState({}); // For form fields above table
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
        { label: 'Add Equipment', href: '#' },
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

                console.log('Fetched assets:', response);

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
            } catch (error) {
                console.error('Error fetching asset classes:', error);
                alert('Failed to fetch asset classes');
            } finally {
                setLoading(false);
            }
        };

        fetchAssetClasses();
    }, []);

    const filteredAssets = assets.filter((a) =>
        a.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAssetClassSelect = async (asset) => {
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

        try {
            setLoading(true);

            const attributeResponse = await axiosWrapper('api/v1/asset-class-attributes/getAssetClassAttribute', {
                method: 'POST',
                data: { assetId: asset.value },
            });

            const attributes = Array.isArray(attributeResponse?.asset_attributes)
                ? attributeResponse.asset_attributes
                : [];
            console.log('Fetched asset attributes:', attributes);

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
            console.log('Fetched templates:', templates);

            const masterResponse = await axiosWrapper('api/v1/asset-masters/getAssetClassMasters', {
                method: 'POST',
                data: { asset_id: asset.value },
            });

            const assetMasters = Array.isArray(masterResponse?.data?.assetMasters)
                ? masterResponse.data.assetMasters
                : [];
            console.log('Fetched asset masters:', assetMasters);

            const processedTemplates = await Promise.all(templates.map(async (template) => {
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
                    console.log(`Leaf nodes for template ${template._id}:`, leafNodes);

                    const compositePathFields = new Set();
                    leafNodes.forEach((node) => {
                        if (node.heading_name.includes('-')) {
                            node.heading_name.split('-').forEach((part) => compositePathFields.add(part));
                        }
                    });

                    const attributes = leafNodes.map((node) => {
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
                                .filter((master) => master[terminal] && Array.from(compositePathFields).every((part) => !master[part]))
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

                    return { ...template, attributes };
                } catch (error) {
                    console.error(`Error fetching leafGroup for template ${template._id}:`, error);
                    return { ...template, attributes: [] };
                }
            }));
            setAssetTemplates(processedTemplates);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert(error?.response?.data?.message || 'Failed to fetch data');
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
            alert('Please select at least one value before adding a row.');
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
            alert('All fields must be selected.');
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

        // Validate form fields
        const formFieldErrors = {};
        groupedItems.flat().forEach((attr) => {
            if (!formFields[attr._id]?.value) {
                formFieldErrors[attr._id] = 'Required';
            }
        });

        // Validate table rows
        const tableErrors = {};
        assetTemplates.forEach((template) => {
            if (!rows[template._id] || rows[template._id].length === 0) {
                tableErrors[template._id] = { general: 'At least one row is required for each template.' };
            }
        });

        if (Object.keys(formFieldErrors).length > 0 || Object.keys(tableErrors).length > 0) {
            setErrors({ ...formFieldErrors, ...tableErrors });
            alert('Please fill in all required fields and add at least one row per template.');
            return;
        }

        // Prepare payload
        const payload = {
            asset_id: selectedAssetId,
            attributes: { ...formFields },
            templates: assetTemplates.map((template) => ({
                template_id: template._id,
                rows: rows[template._id]?.map((row) => ({
                    ...row,
                })) || [],
            })),
        };

        try {
            setLoading(true);
            const response = await axiosWrapper('api/v1/equipments/createEquipment', {
                method: 'POST',
                data: payload,
            });

            alert('Equipment added successfully');
            console.log('Equipment created:', response);
            navigate('/all_assets');
        } catch (error) {
            console.error('Error submitting equipment:', error);
            alert(error?.response?.data?.message || 'Failed to add equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenuploadModal = () => {
        console.log('Opening modal');
        setShowUploadModal(true);
        const firstTemplate = assetTemplates[0] || {};
        setSelectedTemplateId(firstTemplate._id || '');
        setSelectedTemplateCode(firstTemplate.template_code || '');
        setModalValues({ file: null });
        setModalErrors({});
    };

    const handleCloseUploadModal = () => {
        console.log('Closing modal');
        setShowUploadModal(false);
        setModalValues({ file: null });
        setModalErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setModalValues((prev) => ({ ...prev, file }));
        setModalErrors((prev) => ({ ...prev, file: '' }));
    };

    const downloadExcel = async (templateId) => {
        try {
            console.log('Downloading Excel template for:', templateId);
            // Implement download logic
        } catch (error) {
            console.error('Error downloading Excel:', error.message || error);
        }
    };

    const uploadExcel = (e, templateId) => {
        e.preventDefault();
        if (!modalValues.file) {
            setModalErrors({ file: 'Please select a file to upload.' });
            return;
        }
        try {
            console.log('Uploading Excel for:', templateId, modalValues.file);
            alert('Excel data uploaded successfully');
            handleCloseUploadModal();
        } catch (error) {
            setModalErrors({ file: error?.response?.data?.message || 'Failed to upload file' });
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
        <div>
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <div className="pt-3 pb-0 d-flex justify-content-between" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                <div>
                    <Breadcrumb title="Add Equipment" items={breadcrumbItems} />
                </div>
                <div className="dropdown" style={{ position: 'relative' }}>
                    <div
                        className={`form-select btn-bg1 d-flex justify-content-between align-items-center`}
                        style={{
                            height: '40px',
                            width: '240px',
                            borderRadius: '12px',
                            cursor: 'pointer',
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
                                marginTop: '0px',
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
                            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                                <ul className="list-unstyled mb-0">
                                    {filteredAssets.length > 0 ? (
                                        filteredAssets.map((asset) => (
                                            <li
                                                key={asset.value}
                                                onClick={() => handleAssetClassSelect(asset)}
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
            </div>
            <div className="addEuipment">
                <div>
                    <div className="addEuipment-header">
                        <h4>Add Equipment</h4>
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
                                                onClick={handleOpenuploadModal}
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
                                name="Submit"
                                onClick={handleSubmit}
                                className="addEuipment-update-btn"
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
                            marginTop: '100px',
                            maxHeight: 'calc(100vh - 120px)',
                            background: '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="addunit-header">
                            <h4>Bulk Add Data</h4>
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
                                                onClick={() => downloadExcel(selectedTemplateId)}
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

export default AddEquipment