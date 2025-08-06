// src/pages/templates/TemplateBuilder.jsx
import React, { useState, useRef, useEffect } from 'react';
import TemplateBuilderWrapper from '../../components/dragflowprovider/FlowProvider';
import { useLocation, useNavigate, useParams } from 'react-router';
import axiosWrapper from '../../../services/AxiosWrapper';

const TemplateBuilder = () => {
    const location = useLocation();
    const { templateId } = useParams();
    const { templateTypeId, templateTypeName, templateName, templateCode, structure } = location.state || {};

    const [searchQuery, setSearchQuery] = useState("");
    const [templateNameState, setTemplateName] = useState(templateName || "");
    const [templateCodeState, setTemplateCode] = useState(templateCode || "");
    const templateNameRef = useRef();
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [contextMenu, setContextMenu] = useState({ isOpen: false, position: {}, nodeId: null });
    const [edgeLabelModal, setEdgeLabelModal] = useState({ isOpen: false, label: "", edgeId: null });
    const navigate = useNavigate();
    const [templateDataMap, setTemplateDataMap] = useState({});
    //   const [masterData, setMasterData] = useState(null); 
    const [master, setMaster] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch master data from the backend on mount
    useEffect(() => {
        if (!templateTypeId) return;
        const fetchMasterData = async () => {
            try {
                setLoading(true);
                const response = await axiosWrapper("api/v1/template-types/templateTypeMaster", {
                    method: "POST",
                    data: { template_type_id: templateTypeId },
                });

                const { parameter_types } = response || {};
                setMaster(parameter_types || []);
            } catch (err) {
                // console.error("Error fetching master data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMasterData();
    }, [templateTypeId]);
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

                // ✅ Set initial selected node
                if (updatedNodes.length > 0) {
                    setSelectedNodeId(updatedNodes[0].id);
                }

                setNodes(updatedNodes);
                setEdges(edgeList);

            } catch (e) {
                //   console.error("Failed to parse structure:", e);
            }
        }
    }, [structure]);

    const handleSave = async () => {
        if (!templateCodeState || !templateNameState || !templateTypeId) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);

            const structure = JSON.stringify([{ nodes }, { edges }]);

            const payload = {
                template_type_id: templateTypeId,
                template_code: templateCodeState,
                template_name: templateNameState,
                structure,
            };

            const response = await axiosWrapper("api/v1/templates/createTemplate", {
                method: "POST",
                data: payload,
            });

            alert("Template saved successfully!");

            navigate(`/template/${templateTypeId}`);
        } catch (error) {
            // console.error("Error saving template:", error);
            alert("Error saving template. Check console.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdate = async () => {
        if (!templateCodeState || !templateNameState || !templateTypeId || !templateId) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            const structure = JSON.stringify([{ nodes }, { edges }]);

            const payload = {
                id: templateId, // for backend to identify template
                template_type_id: templateTypeId,
                template_code: templateCodeState,
                template_name: templateNameState,
                structure,
            };

            await axiosWrapper("api/v1/templates/updateTemplate", {
                method: "POST",
                data: payload,
            });

            alert("Template updated successfully!");
            navigate(`/template/${templateTypeId}`);
        } catch (error) {
            // console.error("Error updating template:", error);
            alert("Error updating template. Check console.");
        }
    };
    const handleSaveNodeData = async () => {
        try {
            if (!templateCodeState || !templateNameState || !templateTypeId) {
                alert("Please fill all required fields before saving node data.");
                return;
            }

            const payload = {
                id: templateId,
                templateNodeData: templateDataMap,
            };

            await axiosWrapper("api/v1/template-masters/createTemplateMaster", {
                method: "POST",
                data: payload,
            });

            alert("Node data saved successfully!");
        } catch (error) {
            alert("Error saving node data. Check console.");
            console.error(error);
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
                master={master}
                isEditMode={!!templateId}
                isViewMode={location.pathname.includes("/view")}
                usedTemplateTypeIds={[]}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                templateCode={templateCodeState}
                setTemplateCode={setTemplateCode}
                templateName={templateNameState}
                setTemplateName={setTemplateName}
                templateNameRef={templateNameRef}
                handleSave={templateId ? handleUpdate : handleSave}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                edgeLabelModal={edgeLabelModal}
                setEdgeLabelModal={setEdgeLabelModal}
                templateTypeName={templateTypeName}
                selectedNodeId={selectedNodeId}
                setSelectedNodeId={setSelectedNodeId}
                templateDataMap={templateDataMap}
                setTemplateDataMap={setTemplateDataMap}
                handleSaveNodeData={handleSaveNodeData}
            />

        </div>
    );
};

export default TemplateBuilder;
