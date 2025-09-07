import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import Select, { components } from 'react-select'
import { matchPath, useLocation } from "react-router";
import axiosWrapper from "../../../../services/AxiosWrapper";
import Pagination from "../../general/Pagination";
import Loader from "../../general/LoaderAndSpinner/Loader";
import AssetSidebar from "./AssetsSidebar";
import AssetsCustomNode from "./AssetsCustomNode";
import search1 from "../../../assets/icons/search1.svg"
import closeicon from "../../../assets/icons/close.svg"
const initialNodes = [];
const initialEdges = [];

const AssetDragDropFlow = ({
  master,
  nodes,
  setNodes,
  edges,
  setEdges,
  selectedNodeId,
  setSelectedNodeId,
  templateDataMap,
  setTemplateDataMap,
  usedHeaders,
  setUsedHeaders,
  isEditMode,
  templateName,
}) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(false);
  const [assetMasters, setAssetMasters] = useState([]);
  const [leafGroups, setLeafGroups] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [tableSearchQueries, setTableSearchQueries] = useState({});
  const location = useLocation();
  const [edgeContextMenu, setEdgeContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    edgeId: null,
  });

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        changes.forEach((change) => {
          if (change.type === "remove") {
            setTemplateDataMap((prev) => {
              const newMap = { ...prev };
              const targetNode = nodes.find((n) => n.id === change.id?.split("-")[1]);
              if (targetNode) {
                newMap[targetNode.data.label] = newMap[targetNode.data.label]?.map((row) => ({
                  ...row,
                  prevSelections: {},
                }));
              }
              return newMap;
            });
          }
        });
        return newEdges;
      });
    },
    [setEdges, nodes, setTemplateDataMap]
  );

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
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
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const masterData = JSON.parse(event.dataTransfer.getData("application/reactflow"));

      if (!type) return;

      const headerId = masterData.parameterTypeId?._id || masterData.template_type_id;
      if (usedHeaders.has(headerId)) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const id = masterData.master_name === "Asset Class" ? "asset-class-node" : `${+new Date()}`;

      const newNode = {
        id,
        type: "custom",
        position,
        data: {
          label: masterData.master_name,
          selected: false,
          onEdit: (nodeData) => {
            const newLabel = prompt("Edit label:", nodeData.label);
            if (newLabel !== null) {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeData.id
                    ? { ...node, data: { ...node.data, label: newLabel } }
                    : node
                )
              );
            }
          },
          onDelete: (nodeData) => {
            setNodes((prevNodes) => {
              const filtered = prevNodes.filter((node) => node.id !== nodeData.id);
              const nextSelectedId = filtered.length > 0 ? filtered[0].id : null;
              setSelectedNodeId(nextSelectedId);
              return filtered;
            });

            setEdges((prevEdges) =>
              prevEdges.filter(
                (edge) => edge.source !== nodeData.id && edge.target !== nodeData.id
              )
            );

            setUsedHeaders((prev) => {
              const copy = new Set(prev);
              copy.delete(headerId);
              return copy;
            });
          },
          template_master_code: masterData._id,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setUsedHeaders((prev) => new Set(prev).add(headerId));

      if (nodes.length === 0) {
        setSelectedNodeId(id);
      }
    },
    [reactFlowInstance, setNodes, nodes, setSelectedNodeId, usedHeaders, setUsedHeaders]
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, selectedNodeId },
      }))
    );
  }, [selectedNodeId, setNodes]);

  useEffect(() => {
    const handleClick = () => {
      setEdgeContextMenu({ isOpen: false, position: {}, edgeId: null });
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const fetchAttributes = async () => {
      const isViewRoute = matchPath({ path: "/asset/view/:assetId" }, location.pathname);
      if (!isViewRoute) {
        console.log("Not on view route, skipping attribute fetch:", location.pathname);
        return;
      }

      const assetId = isViewRoute.params?.assetId;
      if (!assetId) {
        setErrorMessage("No asset ID found in the URL.");
        return;
      }

      setLoading(true);
      try {
        const attributesResponse = await axiosWrapper(
          "api/v1/asset-attributes/getAssetAttributes",
          {
            method: "POST",
            data: { asset_id: assetId },
          }
        );
        console.log("Initial Attributes API Response:", attributesResponse);
        const allAttributes = attributesResponse.data || [];

        const normalizedAttributes = allAttributes.map((attr) => ({
          ...attr,
          _id: String(attr._id),
          order: String(attr.order || ""),
        }));

        console.log("Setting initial attributes:", normalizedAttributes);
        setAttributes(normalizedAttributes);
      } catch (error) {
        console.error("Error fetching initial asset attributes:", error);
        setErrorMessage(
          error.response?.data?.message || "Failed to fetch asset attributes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [location.pathname]);

  const handleNodeDoubleClick = useCallback(
    async (node) => {
      console.log("Double-clicked node:", { id: node.id, label: node.data.label, templateName });
      const isViewRoute = matchPath({ path: "/asset/view/:assetId" }, location.pathname);

      if (!isViewRoute) {
        console.log("Not on view route:", location.pathname);
        return;
      }

      const assetId = isViewRoute.params?.assetId;
      if (!assetId) {
        setErrorMessage("No asset ID found in the URL.");
        setIsModalOpen(true);
        return;
      }

      // Clear assetMasters to prevent carrying over previous data
      setAssetMasters([]);

      if (
        node.data.label === templateName ||
        node.data.label === "Asset Class" ||
        node.id === "asset-class-node"
      ) {
        console.log("Asset Class node detected, fetching attributes...");
        setLoading(true);

        try {
          let savedAttributes = [];
          try {
            const savedAttributesResponse = await axiosWrapper(
              "api/v1/asset-class-attributes/getAssetClassAttribute",
              {
                method: "POST",
                data: { assetId },
              }
            );
            console.log("Saved Attributes API Response:", savedAttributesResponse);
            savedAttributes = savedAttributesResponse?.asset_attributes || [];
          } catch (error) {
            if (error?.response?.status === 404) {
              console.warn("No saved attributes found for this asset.");
              savedAttributes = [];
            } else {
              console.error("Error fetching saved attributes:", error);
              setErrorMessage(error.response?.data?.message || "Failed to fetch saved attributes.");
            }
          }

          const attributesResponse = await axiosWrapper(
            "api/v1/asset-attributes/getAssetAttributes",
            {
              method: "POST",
              data: { asset_id: assetId },
            }
          );
          console.log("Attributes API Response:", attributesResponse);
          const allAttributes = attributesResponse.data || [];

          const savedCheckedItems = savedAttributes.map((attr) => String(attr._id || attr.id));
          const savedOrders = savedAttributes.reduce((acc, attr) => {
            acc[String(attr._id || attr.id)] = String(attr.order || "");
            return acc;
          }, {});

          const mergedAttributes = allAttributes.map((attr) => ({
            ...attr,
            _id: String(attr._id),
            order: savedOrders[String(attr._id)] || String(attr.order || ""),
          }));

          setAttributes(mergedAttributes);
          setCheckedItems(savedCheckedItems);
          setOrders(savedOrders);
          setAllChecked(savedCheckedItems.length === mergedAttributes.length);

          console.log("Opening attribute modal...");
          setIsAttributeModalOpen(true);
        } catch (error) {
          console.error("Error fetching attributes:", error);
          setErrorMessage(error.response?.data?.message || "Failed to fetch attributes.");
          setIsAttributeModalOpen(true);
        } finally {
          setLoading(false);
        }

        return;
      }

      // Non-Asset Class flow
      console.log("Non-Asset Class node, proceeding with template logic...");
      const masterIdFromNode = node?.data?.template_master_code;
      if (!masterIdFromNode) {
        setErrorMessage("No template ID found for this node.");
        setIsModalOpen(true);
        return;
      }

      setSelectedNode(node);
      setIsModalOpen(true);
      setLoading(true);

      try {
        const leafTemplateResponse = await axiosWrapper(
          "api/v1/template-masters/templateMasters/leaf",
          {
            method: "POST",
            data: { template_id: masterIdFromNode },
          }
        );
        console.log("getTemplatesByTemplateIDLeaf Response:", leafTemplateResponse);

        if (leafTemplateResponse?.groups) {
          setLeafGroups(leafTemplateResponse.groups || []);
          setErrorMessage(null);
        } else {
          setErrorMessage("Failed to fetch leaf templates.");
          setLeafGroups([]);
          return;
        }

        try {
          const assetMasterResponse = await axiosWrapper(
            "api/v1/asset-masters/getAssetMaster",
            {
              method: "POST",
              data: {
                asset_id: assetId,
                template_id: masterIdFromNode,
              },
            }
          );

          if (assetMasterResponse?.data?.length > 0) {
            const normalized = assetMasterResponse.data.map((am) => ({
              document_code: am.document_code,
              template_master_id: am.template_master_id,
              asset_id: am.asset_id,
              node_ids: {
                  ...am.node_ids, // Preserve node_ids from getAssetMaster
                  ...Object.fromEntries(
                    Object.entries(am).filter(([key]) => key !== "_id" && key !== "asset_id" && key !== "template_id" && key !== "template_master_id" && key !== "document_code" && key !== "created_at" && key !== "updated_at" && key !== "deleted_at")
                  ),
                },
            }));
            setAssetMasters(normalized);
          } else {
            setAssetMasters([]);
          }
        } catch (error) {
          if (error?.response?.status === 404) {
            console.warn("No saved asset masters found, showing only leaves.");
            setAssetMasters([]);
          } else {
            console.error("Error fetching asset masters:", error);
            setErrorMessage({ type: "error", text: error.message?.message || "Failed to fetch asset masters." });
            setAssetMasters([]);
          }
        }
      } catch (error) {
        console.error("Error fetching leaf templates:", error);
        setErrorMessage({ type: "error", text: error.message?.message || "Failed to fetch leaf templates." });
        setLeafGroups([]);
      } finally {
        setLoading(false);
      }
    },
    [location.pathname, templateName]
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
    setAssetMasters([]);
    setLeafGroups([]);
    setTableSearchQueries({});
  };

  const closeAttributeModal = () => {
    setIsAttributeModalOpen(false);
    setAttributes([]);
    setCheckedItems([]);
    setAllChecked(false);
    setOrders({});
    setErrorMessage(null);
  };

  const handleHeaderCheckboxChange = (e) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    setCheckedItems(checked ? attributes.map((attr) => attr._id) : []);
  };

  const handleRowCheckboxChange = (id) => {
    setCheckedItems((prev) => {
      const newChecked = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      setAllChecked(newChecked.length === attributes.length);
      return newChecked;
    });
  };

  const handleOrderChange = (id, value) => {
    setOrders((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectedAttributes = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const assetId = matchPath({ path: "/asset/view/:assetId" }, location.pathname)?.params?.assetId;
      if (!assetId) {
        setErrorMessage("No asset ID found in the URL.");
        return;
      }

      const selectedAttributes = checkedItems.map((id) => {
        const attr = attributes.find((a) => a._id === id);
        const order = orders[id] || attr.order || "";
        return {
          id,
          order,
        };
      });

      const missingOrders = selectedAttributes.filter((attr) => !attr.order || attr.order < 1);
      if (missingOrders.length > 0) {
        alert("Please specify a valid order (greater than 0) for all selected attributes.");
        setErrorMessage("Please specify a valid order for all selected attributes.");
        return;
      }

      const payload = {
        asset_id: assetId,
        asset_attribute_ids: selectedAttributes,
      };

      console.log("Saving attributes payload:", payload);

      await axiosWrapper("api/v1/asset-class-attributes/createAssetClassAttribute", {
        method: "POST",
        data: payload,
      });

      alert("Attributes saved successfully!");
      closeAttributeModal();
    } catch (error) {
      console.error("Error saving attributes:", error);
      setErrorMessage(error.response?.data?.message || "Failed to save attributes.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableSearch = (e, masterName) => {
    setTableSearchQueries((prev) => ({
      ...prev,
      [masterName]: e.target.value,
    }));
  };

  const handleMasterRowCheckbox = (templateMasterId, documentCode, nodeIds) => {
    setAssetMasters((prev) => {
      const exists = prev.some((item) => item.document_code === documentCode);
      if (exists) {
        return prev.filter((item) => item.document_code !== documentCode);
      } else {
        return [
          ...prev,
          {
            document_code: documentCode,
            template_master_id: templateMasterId,
            asset_id: matchPath({ path: '/asset/view/:assetId' }, location.pathname)?.params?.assetId,
            node_ids: nodeIds || {}, // Include node_ids
          },
        ];
      }
    });
  };

  const handleSelectAll = (group, checked) => {
    setAssetMasters((prev) => {
      if (checked) {
        const newItems = group.templates
          .filter(
            (t) => !prev.some((item) => item.document_code === t.document_code)
          )
          .map((t) => ({
            document_code: t.document_code,
            template_master_id: t.template_master_id,
            asset_id: matchPath({ path: '/asset/view/:assetId' }, location.pathname)?.params?.assetId,
            node_ids: t.node_ids || {}, // Include node_ids
          }));
        return [...prev, ...newItems];
      } else {
        return prev.filter(
          (item) =>
            !group.templates.some(
              (t) => t.document_code === item.document_code
            )
        );
      }
    });
  };

  const handleAddAssetMaster = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const assetId = matchPath(
        { path: "/asset/view/:assetId" },
        location.pathname
      )?.params?.assetId;

      const templateId = selectedNode?.data?.template_master_code;

      if (!assetId || !templateId) {
        setErrorMessage({ type: "error", text: "Missing asset ID or template ID." });
        return;
      }

      if (assetMasters.length === 0) {
        setErrorMessage({ type: "error", text: "Please select at least one document code." });
        return;
      }

      const payload = {
        asset_id: assetId,
        template_id: templateId,
        data: assetMasters.map((item) => ({
          document_code: item.document_code,
          template_master_id: item.template_master_id,
          node_ids: item.node_ids || {},
        })),
      };

      console.log("Submitting payload:", payload);

      await axiosWrapper("api/v1/asset-masters/createAssetMaster", {
        method: "POST",
        data: payload,
      });

      alert("Asset masters saved successfully!");
      closeModal();
    } catch (error) {
      console.error("Error saving asset masters:", error);
      alert(error?.response?.data?.message || "Failed to save asset masters.");
      setErrorMessage(
        error?.response?.data?.message || "Failed to save asset masters."
      );
    } finally {
      setLoading(false);
    }
  };

  const isGroupFullySelected = (group) =>
    group.templates.every((t) =>
      assetMasters.some((item) => item.document_code === t.document_code)
    );

  const nodeTypes = useMemo(
    () => ({
      custom: (nodeProps) => (
        <AssetsCustomNode {...nodeProps} onDoubleClick={handleNodeDoubleClick} templateName={templateName} />
      ),
    }),
    [handleNodeDoubleClick, templateName]
  );

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const filteredTemplateMasters = leafGroups
    .map((group) => {
      return {
        master_name: group.master_name,
        templates: group.templates.flatMap((t) => {
          const selectedData = t.selectedData || [];
          return selectedData
            .filter((sd) =>
              sd?.[t.label]?.documentcode
                ?.toLowerCase()
                .includes(
                  tableSearchQueries[group.master_name]?.toLowerCase() || ""
                )
            )
            .map((sd) => ({
              _id: sd._id,
              document_code: sd[t.label]?.documentcode,
              template_master_id: sd._id,
              masterId: sd[t.label]?.masterId,
              node_ids: sd[t.label]?.node_ids || {},
            }));
        }),
      };
    })
    .filter((group) => group.templates.length > 0);

  return (
    <>
      <div style={{ display: "flex", height: "600px" }}>
        <div style={{ zIndex: 10, position: "relative" }}>
          <AssetSidebar
            master={master}
            usedTypes={nodes.map((n) => n.data.label)}
            usedHeaders={usedHeaders}
            isEditMode={isEditMode}
          />
        </div>

        <div
          ref={reactFlowWrapper}
          style={{
            flex: 1,
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            onEdgeClick={(event, edge) => {
              event.preventDefault();
              event.stopPropagation();
              const bounds = reactFlowWrapper.current.getBoundingClientRect();
              setEdgeContextMenu({
                isOpen: true,
                position: {
                  x: event.clientX - bounds.left,
                  y: event.clientY - bounds.top,
                },
                edgeId: edge.id,
                label: edge.label || "",
              });
            }}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { pointerEvents: "auto" },
              labelStyle: { pointerEvents: "none" },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <Background gap={12} color="#eee" variant="BackgroundVariant.Lines" />
          </ReactFlow>
          {edgeContextMenu.isOpen && (
            <div
              style={{
                position: "absolute",
                top: edgeContextMenu.position.y,
                left: edgeContextMenu.position.x,
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "5px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                zIndex: 999,
                padding: "4px 0",
                width: "90px",
              }}
            >
              <button
                style={{
                  display: "block",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "4px 10px",
                  fontSize: "11px",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const currentLabel = edgeContextMenu.label || "";
                  const newLabel = prompt("Enter edge label:", currentLabel);
                  if (newLabel !== null) {
                    setEdges((eds) =>
                      eds.map((edge) =>
                        edge.id === edgeContextMenu.edgeId ? { ...edge, label: newLabel } : edge
                      )
                    );
                    setEdgeContextMenu({ isOpen: false, position: {}, edgeId: null });
                  }
                }}
              >
                {edgeContextMenu.label ? "Update" : "Add Label"}
              </button>
              <button
                style={{
                  display: "block",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "4px 10px",
                  fontSize: "11px",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "4px",
                  color: "#d32f2f",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEdges((eds) => eds.filter((edge) => edge.id !== edgeContextMenu.edgeId));
                  setEdgeContextMenu({ isOpen: false, position: {}, edgeId: null });
                }}
              >
                Delete Edge
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay1" onClick={closeModal}>
          <div className="addunit-card2" onClick={(e) => e.stopPropagation()}>
            <div className="addunit-header">
              <h4 className="text-uppercase">
                {selectedNode && selectedNode.data.label
                  ? selectedNode.data.label
                  : "Loading"}
              </h4>
              <a onClick={closeModal} style={{ cursor: "pointer" }}>
                <img
                  src={closeicon}
                  width="28px"
                  height="28px"
                  alt="Close"
                />
              </a>
            </div>

            <form onSubmit={handleAddAssetMaster}>
              <div
                style={{
                  height: "calc(100vh - 50px - 72px)",
                  overflowY: "scroll",
                  padding: "0px 10px 0px 10px",
                }}
              >
                {errorMessage && (
                  <p
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      backgroundColor: errorMessage.type === "error" ? "#f44336" : "#4CAF50",
                      color: "white",
                      fontWeight: "bold",
                      zIndex: 2000,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {errorMessage.text}
                  </p>
                )}
                {loading ? (
                  <p>Loading...</p>
                ) : filteredTemplateMasters.length > 0 ? (
                  filteredTemplateMasters.map((group) => (
                    <div className="table-responsive" key={group.master_name}>
                      <table className="table bg-white align-middle table-text">
                        <thead className="table-head align-middle">
                          <tr>
                            <th className="table-check">
                              <input
                                type="checkbox"
                                checked={isGroupFullySelected(group)}
                                onChange={(e) => handleSelectAll(group, e.target.checked)}
                              />
                            </th>
                            <th className="col d-flex justify-content-between align-items-center">
                              <div>{group.master_name}</div>
                              <div className="tb-search-div">
                                <img src={search1} className="tg-search-icon mt-1" alt="search icon" />
                                <input
                                  className="tb-search-input"
                                  placeholder="Search"
                                  style={{ padding: '8px 35px', height: '48px' }}
                                  value={tableSearchQueries[group.master_name] || ''}
                                  onChange={(e) => handleTableSearch(e, group.master_name)}
                                />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.templates.length > 0 ? (
                            group.templates.map((templateMaster) => (
                              <tr key={templateMaster._id}>
                                <td className="table-check">
                                  <input
                                    type="checkbox"
                                    checked={assetMasters.some(
                                      (item) => item.document_code === templateMaster.document_code
                                    )}
                                    onChange={() =>
                                      handleMasterRowCheckbox(
                                        templateMaster._id,
                                        templateMaster.document_code,
                                        templateMaster.node_ids
                                      )
                                    }
                                  />
                                </td>
                                <td className="col d-flex justify-content-between align-items-center">
                                  {templateMaster.document_code}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} style={{ textAlign: "center", color: "#888" }}>
                                No results found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <p>No templates found.</p>
                )}
              </div>
              <div
                className="addunit-card-footer"
                style={{ position: "absolute", bottom: 0 }}
              >
                <button
                  type="button"
                  className="discard-btn"
                  onClick={closeModal}
                >
                  CANCEL
                </button>
                <button type="submit" className="update-btn">
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAttributeModalOpen && (
        <div
          id="overlay"
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "200px",
          }}
        >
          <div className="addunit-card" style={{ width: "60%", background: "#fff", borderRadius: "8px", maxHeight: "500px" }}>
            <div className="addunit-header">
              <h4>Select Attributes</h4>
              <button
                style={{ border: "none", backgroundColor: "inherit" }}
                type="button"
                className="close"
                onClick={closeAttributeModal}
              >
                <img
                  src={closeicon}
                  width="28px"
                  height="28px"
                  alt="Close"
                />
              </button>
            </div>

            <form onSubmit={handleSelectedAttributes}>
              <div className="asset-table">
                <div className="table-responsive m-3">
                  <table className="table table-striped align-middle table-text">
                    <thead className="table-head align-middle">
                      <tr>
                        <th className="table-check col">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={handleHeaderCheckboxChange}
                          />
                        </th>
                        <th className="col">Display Name</th>
                        <th className="col">Field Type</th>
                        <th className="col">Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributes.map((attribute) => (
                        <tr key={attribute._id}>
                          <td className="table-check col">
                            <input
                              type="checkbox"
                              checked={checkedItems.includes(
                                String(attribute._id)
                              )}
                              onChange={() =>
                                handleRowCheckboxChange(String(attribute._id))
                              }
                            />
                          </td>
                          <td className="col">{attribute.display_name}</td>
                          <td className="col">{attribute.field_type}</td>
                          <td className="col">
                            <input
                              type="number"
                              style={{ all: "unset", width: "70px" }}
                              value={orders[String(attribute._id)] || attribute.order || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 1 || value === "") {
                                  handleOrderChange(
                                    String(attribute._id),
                                    value
                                  );
                                }
                              }}
                              min="1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="addunit-card-footer">
                <button
                  type="button"
                  className="discard-btn"
                  onClick={closeAttributeModal}
                >
                  Close
                </button>
                <button type="submit" className="update-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


export default AssetDragDropFlow;

