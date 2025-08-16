import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import axiosWrapper from '../../../services/AxiosWrapper';
import TemplateBuilderWrapper from '../../components/dragflowprovider/FlowProvider';
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
    const [contextMenu, setContextMenu] = useState({ isOpen: false, position: {}, nodeId: null });
    const [edgeLabelModal, setEdgeLabelModal] = useState({ isOpen: false, label: "", edgeId: null });
    const [templateTypes, setTemplateTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [usedHeaders, setUsedHeaders] = useState(new Set());

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
    }, [location.pathname, setNodes]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Fetch both in parallel
                const [allTypesRes, templatesByTypeRes] = await Promise.all([
                    axiosWrapper("api/v1/template-types/getAllTemplateTypes", { method: "POST" }),
                    axiosWrapper("api/v1/template-types/template-by-type", { method: "POST" })
                ]);

                // Map template-by-type response for quick lookup
                const templatesMap = templatesByTypeRes.reduce((acc, group) => {
                    acc[group.templateType._id] = group.templates.map(tpl => ({
                        _id: tpl._id,
                        master_name: tpl.template_name
                    }));
                    return acc;
                }, {});

                // Merge so every template type is included, even with no masters
                const mergedData = (allTypesRes || []).map(type => ({
                    parameterTypeId: {
                        _id: type._id,
                        template_type_name: type.template_type_name
                    },
                    masters: templatesMap[type._id] || [] // attach if exists, else empty
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

            // Default to 2 connections
            let maxConnections = 2;

            // Special case for AssetBuilder: Asset Class → 4 connections
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
        [nodes, edges, setEdges, location.pathname]
    );




    // Parse structure if editing
    useEffect(() => {
        if (structure) {
            try {
                const parsed = JSON.parse(structure);
                const nodeList = parsed?.[0]?.nodes || [];
                const edgeList = parsed?.[1]?.edges || [];

                const updatedNodes = nodeList.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        onEdit: (nodeData) => handleEditNode(node.id, nodeData.label),
                        onDelete: () => handleDeleteNode(node.id),
                    },
                }));

                if (updatedNodes.length > 0) {
                    setSelectedNodeId(updatedNodes[0].id);
                }

                setNodes(updatedNodes);
                setEdges(edgeList);
            } catch (e) {
                console.error("Failed to parse asset structure:", e);
            }
        }
    }, [structure]);

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
            navigate("/assets"); // go back to asset list
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
                id: assetId,
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

    const handleEditNode = (id, label) => {
        const newLabel = prompt("Edit label:", label);
        if (newLabel !== null) {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
                )
            );
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

    return (
        <div>
            <TemplateBuilderWrapper
            isAsset={true} 
                templateTypeName="Asset"
                master={templateTypes} // if that's what your master is
                usedTemplateTypeIds={[]} // or real array if you have one
                templateDataMap={assetDataMap} // or real object if you have one
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
        </div>
    );
};

export default AssetBuilder;