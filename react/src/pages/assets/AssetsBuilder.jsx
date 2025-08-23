import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { addEdge, MarkerType } from "reactflow";
import axiosWrapper from '../../../services/AxiosWrapper';
import TemplateBuilderWrapper from '../../components/dragflowprovider/FlowProvider';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Loader from '../../components/general/LoaderAndSpinner/Loader';
const AssetBuilder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { assetId } = useParams();

    // From navigation state if editing
    const { assetCode, assetName, structure } = location.state || {};

    const [searchQuery, setSearchQuery] = useState("");
    const [assetNameState, setAssetName] = useState(assetName || "");
    const [assetCodeState, setAssetCode] = useState(assetCode || "");
    const assetNameRef = useRef();
    const [assetDataMap, setAssetDataMap] = useState({});
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [contextMenu, setContextMenu] = useState({ isOpen: false, position: {}, nodeId: null });
    const [edgeLabelModal, setEdgeLabelModal] = useState({ isOpen: false, label: "", edgeId: null });
    const [templateTypes, setTemplateTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [usedHeaders, setUsedHeaders] = useState(new Set());
    const [showAddSpecModal, setShowAddSpecModal] = useState(false);
    const [showEditSpecModal, setShowEditSpecModal] = useState(false);
    const [showViewSpecModal, setShowViewSpecModal] = useState(false);
    const [specValues, setSpecValues] = useState({});
    const [editSpecValues, setEditSpecValues] = useState({});
    const [specErrors, setSpecErrors] = useState({});
    const [editSpecErrors, setEditSpecErrors] = useState({});
    const [specifications, setSpecifications] = useState([]);
    const [rawSpecifications, setRawSpecifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sortBy, setSortBy] = useState("field_name");
    const [pageSize, setPageSize] = useState(10);
    const [order, setOrder] = useState("asc");
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configValues, setConfigValues] = useState({});
    const [configErrors, setConfigErrors] = useState({
        asset_id: "",
        template_id: "",
        order: "", // Default to empty, as per backend
        row_limit: "",
    });
    useEffect(() => {
        const isAssetBuilder = location.pathname.includes("asset");

        if (isAssetBuilder) {
            setNodes((nds) => {
                const alreadyHasAssetClass = nds.some(node => node.data.label === "Asset Class");
                if (alreadyHasAssetClass) return nds;

                const defaultNode = {
                    id: "asset-class-node",
                    type: "custom",
                    position: { x: 250, y: 100 },
                    data: {
                        label: "Asset Class",
                        selected: false,
                        onEdit: null,
                        onDelete: null,
                    },
                };
                return [...nds, defaultNode];
            });
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [allTypesRes, templatesByTypeRes] = await Promise.all([
                    axiosWrapper("api/v1/template-types/getAllTemplateTypes", { method: "POST" }),
                    axiosWrapper("api/v1/template-types/template-by-type", { method: "POST" })
                ]);

                const templatesMap = templatesByTypeRes.reduce((acc, group) => {
                    acc[group.templateType._id] = group.templates.map(tpl => ({
                        _id: tpl._id,
                        master_name: tpl.template_name
                    }));
                    return acc;
                }, {});

                const mergedData = (allTypesRes || []).map(type => ({
                    parameterTypeId: {
                        _id: type._id,
                        template_type_name: type.template_type_name
                    },
                    masters: templatesMap[type._id] || []
                }));

                setTemplateTypes(mergedData);
                console.log("Merged data for Sidebar:", mergedData);
            } catch (err) {
                console.error("Error fetching template data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const onConnect = useCallback(
        (params) => {
            const sourceNode = nodes.find((n) => n.id === params.source);
            if (!sourceNode) return;

            let maxConnections = 2;
            if (location.pathname.includes("asset") && sourceNode.data.label === "Asset Class") {
                maxConnections = 4;
            }

            const existingConnections = edges.filter(e => e.source === sourceNode.id).length;
            if (existingConnections >= maxConnections) {
                alert(`"${sourceNode.data.label}" can only have ${maxConnections} outgoing connections.`);
                return;
            }

            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    },
                    eds
                )
            );
        },
        [nodes, edges, location.pathname]
    );

    useEffect(() => {
        if (structure && templateTypes.length > 0) {  // Ensure templateTypes is loaded
            try {
                const parsed = JSON.parse(structure);
                const nodeList = parsed?.[0]?.nodes || [];
                const edgeList = parsed?.[1]?.edges || [];

                const usedHeaderIds = new Set();

                const updatedNodes = nodeList.map((node) => {
                    const templateMasterCode = node.data?.template_master_code;
                    let parameterTypeId = null;

                    if (templateMasterCode) {
                        const templateType = templateTypes.find((type) =>
                            type.masters.some((master) => master._id === templateMasterCode)
                        );
                        parameterTypeId = templateType?.parameterTypeId?._id;
                        if (parameterTypeId) {
                            usedHeaderIds.add(parameterTypeId);
                        }
                    }

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            onEdit: (nodeData) => handleEditNode(node.id, nodeData),
                            onDelete: () => {
                                handleDeleteNode(node.id);
                                if (parameterTypeId) {
                                    setUsedHeaders((prev) => {
                                        const copy = new Set(prev);
                                        copy.delete(parameterTypeId);
                                        return copy;
                                    });
                                }
                            },
                            onAddSpecification: () => handleAddSpecification(node),
                            onViewSpecification: () => handleViewSpecification(node),
                        },
                    };
                });

                setUsedHeaders(usedHeaderIds);  // Bind used headers from structure

                const preSelectedNode = updatedNodes.find(node => node.selected) || updatedNodes[0];
                setSelectedNodeId(preSelectedNode?.id || null);
                setNodes(updatedNodes);
                setEdges(edgeList);
            } catch (e) {
                console.error("Failed to parse asset structure:", e);
            }
        }
    }, [structure, templateTypes]);

    const handleSave = async () => {
        if (!assetCodeState || !assetNameState) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);
            const structureData = JSON.stringify([{ nodes }, { edges }]);
            const payload = {
                asset_code: assetCodeState,
                asset_name: assetNameState,
                structure: structureData,
            };

            await axiosWrapper("api/v1/assets/createAsset", {
                method: "POST",
                data: payload,
            });

            alert("Asset created successfully!");
            navigate("/assets");
        } catch (error) {
            alert(error?.response?.data?.message || "Error creating asset");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!assetCodeState || !assetNameState || !assetId) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);
            const structureData = JSON.stringify([{ nodes }, { edges }]);
            const payload = {
                asset_id: assetId,
                asset_code: assetCodeState,
                asset_name: assetNameState,
                structure: structureData,
            };

            await axiosWrapper("api/v1/assets/updateAsset", {
                method: "POST",
                data: payload,
            });

            alert("Asset updated successfully!");
            navigate("/assets");
        } catch (error) {
            alert(error?.response?.data?.message || "Error updating asset");
        } finally {
            setLoading(false);
        }
    };

    const handleEditNode = async (id, nodeData) => {
        setSelectedNodeId(id);
        setSelectedTemplateId(nodeData?.template_master_code || nodeData?.data?.template_master_code || "");
        const templateId = nodeData?.template_master_code || nodeData?.data?.template_master_code || "";
        console.log(nodeData)
        try {
            setLoading(true);
            const response = await axiosWrapper("api/v1/asset-configurations/getAssetConfiguration", {
                method: "POST",
                data: {
                    asset_id: assetId || "",
                    template_id: templateId || "",
                },
            });

            const configData = response || {};
            console.log(configData);
            setConfigValues({
                  _id: configData._id || "",
                asset_id: configData.asset_id?._id || assetId || "",
                template_id: configData.template_id?._id || nodeData?.template_master_code || "",
                order: configData?.order ?? "0",
                row_limit: configData?.row_limit ?? "0",
            });
            setConfigErrors({});
            setShowConfigModal(true);
        } catch (error) {
            console.error("Error fetching configuration:", error);
            // If no configuration exists, open modal with empty fields
            setConfigValues({
                asset_id: assetId || "",
                template_id: nodeData?.template_master_code || "",
                order: "",
                row_limit: "",
            });
            setConfigErrors({});
            setShowConfigModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNode = (id) => {
        setNodes((prevNodes) => {
            const filtered = prevNodes.filter((node) => node.id !== id);
            const nextSelected = filtered.length > 0 ? filtered[0].id : null;
            setSelectedNodeId(nextSelected);
            return filtered;
        });
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    };

    const handleAddSpecification = (node) => {
        setSelectedNodeId(node.id);
        setSelectedTemplateId(node?.data?.template_master_code || "");
        setSpecValues({
            asset_id: assetId || "",
            template_id: node?.data?.template_master_code || "",
            field_name: "",
            field_type: "",
            field_value: "",
            display_name: "",
            required: "false",
            is_unique: "false",
            master_id: "",
        });
        setSpecErrors({});
        setShowAddSpecModal(true);
    };

    const handleSubmitSpecification = async (values, setErrors, onSuccess, isEdit = false) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                asset_id: assetId,
                template_id: selectedTemplateId,
                field_value: isEdit ? values.field_value.split(", ") : values.field_value ? [values.field_value] : [],
                required: values.required === "true",
                is_unique: values.is_unique === "true"
            };

            let url = isEdit
                ? "api/v1/specifications/updateSpecification"
                : "api/v1/specifications/createSpecification";

            await axiosWrapper(url, { method: "POST", data: payload });

            onSuccess();
            if (isEdit) {
                setShowEditSpecModal(false);
                setEditSpecValues({});
                setEditSpecErrors({});
            } else {
                setShowAddSpecModal(false);
                setSpecValues({});
                setSpecErrors({});
            }
            fetchSpecifications(currentPage, pageSize, sortBy, order);
            alert(isEdit ? "Specification updated ✅" : "Specification created ✅");
        } catch (error) {
            if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Error saving specification:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewSpecification = (node) => {
        console.log("Node data in handleViewSpecification:", node); // Debug: Log full node
        console.log("Template master code:", node?.data?.template_master_code); // Debug: Log template_master_code
        console.log("All nodes state:", nodes); // Debug: Log nodes state
        setSelectedNodeId(node.id);
        const templateId = node?.data?.template_master_code || "";
        setSelectedTemplateId(templateId);
        setShowViewSpecModal(true);
        fetchSpecifications(1, pageSize, sortBy, order, templateId); // Pass templateId directly
    };

   const openEditModal = (rowId) => {
        console.log("Received rowId in openEditModal:", rowId);
        console.log("Current raw specifications state:", rawSpecifications);
        const specToEdit = rawSpecifications.find((s) => s._id === rowId);
        if (!specToEdit) {
            console.error("Specification not found for ID:", rowId);
            return;
        }
        console.log("specToEdit:", specToEdit);
        const editValues = {
            _id: specToEdit._id || "",
            asset_id: specToEdit.asset_id || assetId || "",
            template_id: specToEdit.template_id || "",
            field_name: specToEdit.field_name || "",
            field_type: specToEdit.field_type || "",
            field_value: Array.isArray(specToEdit.field_value) ? specToEdit.field_value.join(", ") : specToEdit.field_value || "",
            display_name: specToEdit.display_name || "",
            required: specToEdit.required ? "true" : "false",
            is_unique: specToEdit.is_unique ? "true" : "false",
            master_id: specToEdit.master_id || "",
        };
        console.log("Data for Edit Modal:", editValues);

        setEditSpecValues(editValues);
        setSelectedTemplateId(specToEdit.template_id || "");
        setEditSpecErrors({});
        setShowEditSpecModal(true);
        setShowViewSpecModal(false);
    };

    const specHeaders = [
        { label: "FIELD NAME", key: "field_name", sortable: true },
        { label: "FIELD TYPE", key: "field_type", sortable: true },
        { label: "FIELD VALUE", key: "field_value" },
        { label: "DISPLAY NAME", key: "display_name", sortable: true },
        { label: "REQUIRED", key: "required" },
        { label: "ACTIONS", key: "action" }
    ];

    const fetchSpecifications = async (
        page = 1,
        limit = pageSize,
        sort = sortBy,
        sortOrder = order,
        templateId = selectedTemplateId // Add templateId parameter
    ) => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);
            params.append("sortBy", sort);
            params.append("order", sortOrder);
            params.append("asset_id", assetId || "");
            params.append("template_id", templateId || "");

            console.log("Fetch specifications params:", params.toString()); // Debug: Log API params

            const response = await axiosWrapper(
                `api/v1/specifications/paginateSpecifications?${params.toString()}`,
                { method: "POST" }
            );

            console.log("Fetch specifications response:", response); // Debug: Log API response

            setRawSpecifications(response?.specifications || []);

            const mapped = response?.specifications?.map((spec, index) => ({
                ...spec,
                index: index + 1 + (page - 1) * pageSize,
                required: spec.required ? "Yes" : "No",
                is_unique: spec.is_unique ? "Yes" : "No",
                field_value: Array.isArray(spec.field_value) ? spec.field_value.join(", ") : spec.field_value || "",
            }));

            setSpecifications(mapped);
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
            setTotalItems(response.totalItems);
        } catch (error) {
            console.error("Error fetching specifications:", error.message || error);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteSpecification = async (specificationId) => {
        if (!specificationId) {
            console.error("No specification ID provided for deletion");
            return;
        }

        try {
            setLoading(true);
            await axiosWrapper("api/v1/specifications/destroySpecification", {
                method: "POST",
                data: { id: specificationId },
            });

            fetchSpecifications(currentPage, pageSize, sortBy, order, selectedTemplateId);
            // setShowViewSpecModal(false);
            alert("Specification deleted successfully ✅");
        } catch (error) {
            console.error("Error deleting specification:", error.message || error);
        } finally {
            setLoading(false);
        }
    };
    const handleSaveConfiguration = async (values, setErrors, onSuccess) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                asset_id: assetId,
                template_id: selectedTemplateId,
                order: values.order,
                row_limit: values.row_limit,
            };

            let url = "api/v1/asset-configurations/upsertConfiguration";

            await axiosWrapper(url, { method: "POST", data: payload });

            onSuccess();
        } catch (error) {
            alert(error?.response?.data?.message || "Error saving configuration");
        } finally {
            setLoading(false);
        }
    };
    const configFields = [
        {
            label: "Order",
            name: "order",
            type: "number",
            placeholder: "Enter order",
            required: true,
            isNumeric: true,
        },
        {
            label: "Row Limit",
            name: "row_limit",
            type: "number",
            placeholder: "Enter row limit",
            required: true,
            isNumeric: true,
        },
    ];
    return (
        <div>
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <TemplateBuilderWrapper
                isAsset={true}
                templateTypeName="Asset Class"
                master={templateTypes}
                usedTemplateTypeIds={[]}
                templateDataMap={assetDataMap}
                setTemplateDataMap={setAssetDataMap}
                onConnect={onConnect}
                parameterTypes={templateTypes}
                isEditMode={!!assetId}
                isViewMode={location.pathname.includes("/view")}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                templateCode={assetCodeState}
                setTemplateCode={setAssetCode}
                templateName={assetNameState}
                setTemplateName={setAssetName}
                templateNameRef={assetNameRef}
                handleSave={assetId ? handleUpdate : handleSave}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                edgeLabelModal={edgeLabelModal}
                setEdgeLabelModal={setEdgeLabelModal}
                selectedNodeId={selectedNodeId}
                setSelectedNodeId={setSelectedNodeId}
                usedHeaders={usedHeaders}
                setUsedHeaders={setUsedHeaders}
            />

            {showAddSpecModal && (
                <Modal
                    title="Add Specification"
                    fields={[
                        { name: "field_name", label: "Field Name", type: "text", required: true },
                        {
                            name: "field_type",
                            label: "Field Type",
                            type: "dropdown",
                            options: [
                                { label: "String", value: "string" },
                                { label: "Number", value: "number" },
                                { label: "Select", value: "select" },
                                { label: "Date", value: "date" },
                                { label: "Textarea", value: "textarea" },
                                { label: "File", value: "file" },
                                { label: "List", value: "list" },
                            ],
                            required: true,
                        },
                        { name: "field_value", label: "Field Value", type: "text" },
                        { name: "display_name", label: "Display Name", type: "text", required: true },
                        {
                            name: "required",
                            label: "Required",
                            type: "dropdown",
                            options: [
                                { label: "Yes", value: "true" },
                                { label: "No", value: "false" },
                            ],
                            required: true,
                        },
                        {
                            name: "is_unique",
                            label: "Is Unique",
                            type: "dropdown",
                            options: [
                                { label: "Yes", value: "true" },
                                { label: "No", value: "false" },
                            ],
                            required: true,
                        },
                    ]}
                    values={specValues}
                    setValues={setSpecValues}
                    errors={specErrors}
                    setErrors={setSpecErrors}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setSpecValues((prev) => ({ ...prev, [name]: value }));
                    }}
                    onSubmit={(values) => handleSubmitSpecification(values, setSpecErrors, () => {
                        setShowAddSpecModal(false);
                        setSpecValues({});
                    }, false)}
                    onClose={() => {
                        setShowAddSpecModal(false);
                        setSelectedTemplateId(null);
                        setSpecValues({});
                        setSpecErrors({});
                    }}
                    submitButtonLabel="Create Specification"
                    zIndex={10000}
                />
            )}

            {showEditSpecModal && (
                <Modal
                    title="Update Specification"
                    fields={[
                        { name: "field_name", label: "Field Name", type: "text", required: true },
                        {
                            name: "field_type",
                            label: "Field Type",
                            type: "dropdown",
                            options: [
                                { label: "String", value: "string" },
                                { label: "Number", value: "number" },
                                { label: "Select", value: "select" },
                                { label: "Date", value: "date" },
                                { label: "Textarea", value: "textarea" },
                                { label: "File", value: "file" },
                                { label: "List", value: "list" },
                            ],
                            required: true,
                        },
                        { name: "field_value", label: "Field Value", type: "text" },
                        { name: "display_name", label: "Display Name", type: "text", required: true },
                        {
                            name: "required",
                            label: "Required",
                            type: "dropdown",
                            options: [
                                { label: "Yes", value: "true" },
                                { label: "No", value: "false" },
                            ],
                            required: true,
                        },
                        {
                            name: "is_unique",
                            label: "Is Unique",
                            type: "dropdown",
                            options: [
                                { label: "Yes", value: "true" },
                                { label: "No", value: "false" },
                            ],
                            required: true,
                        },
                    ]}
                    values={editSpecValues}
                    setValues={setEditSpecValues}
                    errors={editSpecErrors}
                    setErrors={setEditSpecErrors}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setEditSpecValues((prev) => ({ ...prev, [name]: value }));
                    }}
                    onSubmit={(values) => handleSubmitSpecification(values, setEditSpecErrors, () => {
                        setShowEditSpecModal(false);
                        setEditSpecValues({});
                    }, true)}
                    onClose={() => {
                        setShowEditSpecModal(false);
                        setSelectedTemplateId(null);
                        setEditSpecValues({});
                        setEditSpecErrors({});
                    }}
                    submitButtonLabel="Update Specification"
                    zIndex={10001}
                />
            )}

            {showViewSpecModal && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 9999,
                        overflowY: "auto",
                    }}
                >
                    <div>
                        <div
                            className=""
                            style={{
                                maxHeight: "calc(100vh - 120px)",
                                background: "#fff",
                                borderRadius: "8px",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden"
                            }}
                        >
                            <div className="addunit-header d-flex justify-content-between align-items-center">
                                <h4>{"Specifications"}</h4>
                                <a onClick={() => setShowViewSpecModal(false)} style={{ cursor: "pointer" }}>
                                    <img
                                        src="src/assets/icons/close.svg"
                                        width="28px"
                                        height="28px"
                                        alt="Close"
                                    />
                                </a>
                            </div>

                            <div
                                className="addunit-form"
                                style={{ maxHeight: "420px", overflowY: "auto" }}
                            >
                                <Table
                                    headers={specHeaders}
                                    rows={specifications}
                                    paginationProps={{
                                        currentPage,
                                        totalPages,
                                        totalItems,
                                        pageSize,
                                        onPageChange: (page) => fetchSpecifications(page, pageSize, sortBy, order),
                                    }}
                                    sortBy={sortBy}
                                    order={order}
                                    onSortChange={(key, newOrder) => {
                                        setSortBy(key);
                                        setOrder(newOrder);
                                        fetchSpecifications(1, pageSize, key, newOrder);
                                    }}
                                    onEdit={(row) => openEditModal(row._id)}
                                    onDelete={(row) => {
                                        if (window.confirm(`Are you sure you want to delete the specification "${row.field_name}"?`)) {
                                            handleDeleteSpecification(row._id);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showConfigModal && (
                <Modal
                    title="Configuration"
                    fields={configFields}
                    values={configValues}
                    setValues={setConfigValues}
                    errors={configErrors}
                    setErrors={setConfigErrors}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setConfigValues((prev) => ({ ...prev, [name]: value }));
                    }}
                    onSubmit={handleSaveConfiguration}
                    onClose={() => {
                        setShowConfigModal(false);
                        setConfigValues({ asset_id: "", template_id: "", order: "", row_limit: "" });
                        setConfigErrors({});
                    }}
                    submitButtonLabel="Save"
                />
            )}
        </div>
    );
};

export default AssetBuilder;