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
  const [master, setMaster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateData, setTemplateData] = useState([]);

  useEffect(() => {
    const parseStructure = (structureString) => {
      try {
        if (!structureString) {
          console.warn("No structure provided for parsing");
          return { nodes: [], edges: [] };
        }
        const parsed = JSON.parse(structureString);
        const nodeList = parsed?.[0]?.nodes || [];
        const edgeList = parsed?.[1]?.edges || [];
        const updatedNodes = nodeList.map((node) => ({
          ...node,
          data: {
            ...node.data,
            selectedData: node.data.selectedData || [],
            onEdit: location.pathname.includes("/view") ? null : (nodeData) => handleEditNode(node.id, nodeData.label),
            onDelete: location.pathname.includes("/view") ? null : () => handleDeleteNode(node.id),
          },
        }));
        console.log("Parsed structure:", { nodes: updatedNodes, edges: edgeList });
        return { nodes: updatedNodes, edges: edgeList };
      } catch (e) {
        console.error("Failed to parse structure:", e, "Structure:", structureString);
        return { nodes: [], edges: [] };
      }
    };

    const initializeTemplateDataMap = (templateData) => {
      const newMap = {};
      if (templateData.length > 0 && templateData[0].structure) {
        try {
          const parsed = JSON.parse(templateData[0].structure);
          const nodes = parsed?.[0]?.nodes || [];
          nodes.forEach((node) => {
            const label = node.data.label;
            const selectedData = node.data.selectedData || [];
            newMap[label] = selectedData.map((row) => ({
              [label]: row[label] || row,
              _id: row._id,
              prevSelections: row.prevSelections || {},
            }));
          });
          // Add document_code from template_master
          newMap.document_code = templateData[0].document_code || [];
        } catch (e) {
          console.error("Failed to parse template_data structure:", e);
        }
      }
      return newMap;
    };

    const fetchTemplate = async () => {
      console.log("fetchTemplate called with templateId:", templateId, "location.state:", location.state);

      if (structure) {
        console.log("Using location.state structure");
        const { nodes, edges } = parseStructure(structure);
        setNodes(nodes);
        setEdges(edges);
        if (nodes.length > 0) {
          setSelectedNodeId(nodes[0].id);
        }
      }

      if (templateId) {
        try {
          setLoading(true);
          const response = await axiosWrapper("api/v1/templates/getTemplate", {
            method: "POST",
            data: { id: templateId },
          });

          console.log("API response:", response);
          const tpl = response; // Fixed: Access response.template.data
          const tplData = response?.template_data[0];
          console.log(tplData)
          if (tplData?.structure) {
            const { nodes, edges } = parseStructure(tplData.structure);
            setNodes(nodes);
            setEdges(edges);
            if (nodes.length > 0) {
              setSelectedNodeId(nodes[0].id);
            }
            setTemplateName(tpl.template_name || templateNameState);
            setTemplateCode(tpl.template_code || templateCodeState);
            setTemplateData(tplData.template_data || []);
            setTemplateDataMap(initializeTemplateDataMap(tpl.template_data || []));
          } else {
            console.warn("No structure in API response");
          }
        } catch (err) {
          console.error("Error fetching template:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [templateId, structure]);

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
        console.error("Error fetching master data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterData();
  }, [templateTypeId]);

  useEffect(() => {
    console.log("Current nodes:", nodes);
    console.log("Current edges:", edges);
    console.log("Current templateDataMap:", templateDataMap);
  }, [nodes, edges, templateDataMap]);

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
      await axiosWrapper("api/v1/templates/createTemplate", {
        method: "POST",
        data: payload,
      });
      alert("Template saved successfully!");
      navigate(`/template/${templateTypeId}`);
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error saving template. Check console.");
    } finally {
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
        id: templateId,
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
      console.error("Error updating template:", error);
      alert("Error updating template. Check console.");
    }
  };

  const handleSaveNodeData = async () => {
    try {
      if (!templateCodeState || !templateNameState || !templateTypeId) {
        alert("Please fill all required fields before saving node data.");
        return;
      }
      const structure = JSON.stringify([{ nodes }, { edges }]);
      const payload = {
        id: templateId,
        templateNodeData: templateDataMap,
        structure,
      };
      console.log("Payload sent to createTemplateMaster:", payload);
      await axiosWrapper("api/v1/template-masters/createTemplateMaster", {
        method: "POST",
        data: payload,
      });
      alert("Node data saved successfully!");
    } catch (error) {
      console.error("Error saving node data:", error);
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
    setTemplateDataMap((prev) => {
      const newMap = { ...prev };
      const node = nodes.find((n) => n.id === id);
      if (node) delete newMap[node.data.label];
      return newMap;
    });
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      <TemplateBuilderWrapper
        master={master}
        isEditMode={!!templateId && !location.pathname.includes("/view")}
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
        templateData={templateData}
      />
    </div>
  );
};

export default TemplateBuilder;
