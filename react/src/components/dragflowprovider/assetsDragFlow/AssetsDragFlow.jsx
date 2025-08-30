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
}) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        // If an edge is deleted, clear prevSelections for affected nodes
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
    [setEdges, nodes]
  );
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
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
      const id = `${+new Date()}`;

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
        data: {
          ...node.data,
          selectedNodeId,
        },
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

 const handleNodeDoubleClick = useCallback(
    async (node) => {
      const isViewRoute = matchPath({ path: "/asset/view/:assetId" }, location.pathname);

      if (!isViewRoute) {
        return;
      }

      if (node.data.label === "Asset Class") {
        console.log("Asset Class node double-clicked, no API call.");
        return;
      }

      console.log("Double click node", node);
      const masterIdFromNode = node?.data?.template_master_code;
      if (!masterIdFromNode) {
        setErrorMessage("No template ID found for this node.");
        setIsModalOpen(true);
        return;
      }

      const assetId = isViewRoute.params?.assetId;
      if (!assetId) {
        setErrorMessage("No asset ID found in the URL.");
        setIsModalOpen(true);
        return;
      }

      setSelectedNode(node);
      setIsModalOpen(true);
      setLoading(true);

      try {
        const [assetMasterResponse, leafTemplateResponse] = await Promise.all([
          axiosWrapper("api/v1/asset-masters/getAssetMaster", {
            method: "POST",
            data: {
              asset_id: assetId,
              template_id: masterIdFromNode,
            },
          }),
          axiosWrapper("api/v1/template-masters/templateMasters/leaf", {
            method: "POST",
            data: {
              template_id: masterIdFromNode,
            },
          }),
        ]);

        // Handle getAssetMaster response
        const { message: assetMessage, data: assetData } = assetMasterResponse.data;
        console.log("getAssetMaster Response:", assetMasterResponse.data);

        // Handle getTemplatesByTemplateIDLeaf response
        const { message: leafMessage, groups: leafData } = leafTemplateResponse.data;
        console.log("getTemplatesByTemplateIDLeaf Response:", leafTemplateResponse.data);

        if (assetMasterResponse.status === 200 && leafTemplateResponse.status === 200) {
          setAssetMasters(assetData);
          setLeafGroups(leafData);
          setErrorMessage(null);
        } else {
          setErrorMessage(
            assetMasterResponse.status !== 200
              ? assetMessage || "Failed to fetch asset data."
              : leafMessage || "Failed to fetch leaf templates."
          );
          setAssetMasters([]);
          setLeafGroups([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage(error.response?.data?.message || "Failed to fetch data.");
        setAssetMasters([]);
        setLeafGroups([]);
      } finally {
        setLoading(false);
      }
    },
    [location.pathname]
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
    setAssetMasters([]);
    setLeafGroups([]);
    setTableSearchQueries({});
  };

  const handleTableSearch = (e, masterName) => {
    setTableSearchQueries((prev) => ({
      ...prev,
      [masterName]: e.target.value,
    }));
  };

  // Placeholder functions for UI (not implemented as per your request)
  const handleAddAssetMaster = (e) => {
    e.preventDefault();
    // Placeholder: Add your submit logic here
    console.log("Submit clicked");
    closeModal();
  };

  const handleMasterHeaderCheckbox = (masterName) => {
    // Placeholder: Add your checkbox logic here
    console.log(`Header checkbox for ${masterName} clicked`);
  };

  const handleMasterRowCheckbox = (templateMasterId, documentCode) => {
    // Placeholder: Add your row checkbox logic here
    console.log(`Row checkbox for ${templateMasterId} clicked`);
  };

  const nodeTypes = useMemo(
    () => ({
      custom: (nodeProps) => (
        <AssetsCustomNode {...nodeProps} onDoubleClick={handleNodeDoubleClick} />
      ),
    }),
    [handleNodeDoubleClick]
  );

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  // Group assetMasters by a property (e.g., template_master_id.name) for display
  const groupedAssetMasters = assetMasters.reduce((acc, asset) => {
    const masterName = asset.template_master_id?.name || "Unknown";
    if (!acc[masterName]) {
      acc[masterName] = { master_name: masterName, templates: [] };
    }
    acc[masterName].templates.push(asset);
    return acc;
  }, {});

 const filteredTemplateMasters = leafGroups.map((group) => {
    const templates = group.nodes
      .map((node) => {
        const matchingAsset = assetMasters.find(
          (asset) => asset.template_master_id?.name === group.master_name
        );
        return matchingAsset
          ? {
              _id: matchingAsset._id,
              asset_master_code: matchingAsset.asset_master_code,
            }
          : null;
      })
      .filter((template) => template !== null);

    return {
      master_name: group.master_name,
      templates: templates.filter((template) =>
        template.asset_master_code
          ?.toLowerCase()
          .includes(tableSearchQueries[group.master_name]?.toLowerCase() || "")
      ),
    };
  }).filter((group) => group.templates.length > 0);

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
        <div className="modal-overlay1" onClick={() => setIsModalOpen(false)}>
          <div className="addunit-card2" onClick={(e) => e.stopPropagation()}>
            <div className="addunit-header">
              <h4 className="text-uppercase">
                {selectedNode && selectedNode.data.label
                  ? selectedNode.data.label
                  : "Loading"}
              </h4>
              <button
                style={{ border: "none", backgroundColor: "inherit" }}
                type="button"
                className="close"
                onClick={closeModal}
              >
                <a onClick={() => setIsModalOpen(false)} style={{ cursor: "pointer" }}>
                <img
                  src="src/assets/icons/close.svg"
                  width="28px"
                  height="28px"
                  alt="Close"
                />
              </a>
              </button>
            </div>

            <form onSubmit={handleAddAssetMaster}>
              <div
                className="addunit-form"
                style={{
                  height: "calc(100vh - 50px - 72px)",
                  overflowY: "scroll",
                  padding: "0px 10px 0px 10px",
                }}
              >
                {loading ? (
                  <p>Loading...</p>
                ) : errorMessage ? (
                  <p style={{ color: "red" }}>{errorMessage}</p>
                ) : filteredTemplateMasters.length > 0 ? (
                  filteredTemplateMasters.map((group) => {
                    const allChecked =
                      group.templates.length > 0 &&
                      group.templates.every((templateMaster) =>
                        assetMasters.some(
                          (item) => item._id === templateMaster._id
                        )
                      );

                    return (
                      <div
                        className="table-responsive"
                        key={group.master_name}
                      >
                        <table className="table table-text">
                          <thead className="table-head align-middle">
                            <tr>
                              <th
                                style={{
                                  borderBottomWidth: 0,
                                  width: "60px",
                                }}
                                className="table-check"
                              >
                                <input
                                  style={{ marginLeft: "10px" }}
                                  type="checkbox"
                                  checked={allChecked}
                                  onChange={() =>
                                    handleMasterHeaderCheckbox(group.master_name)
                                  }
                                />
                              </th>
                              <th className="d-flex justify-content-between align-items-center">
                                <div>{group.master_name}</div>
                                <div className="tb-search-div">
                                  <img
                                    src={search1}
                                    className="tg-search-icon"
                                    alt="search icon"
                                  />
                                  <input
                                    className="tb-search-input"
                                    placeholder="search"
                                    style={{
                                      padding: "8px 35px",
                                      height: "42px",
                                    }}
                                    value={tableSearchQueries[group.master_name] || ""}
                                    onChange={(e) =>
                                      handleTableSearch(e, group.master_name)
                                    }
                                  />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.templates.length > 0 ? (
                              group.templates.map((templateMaster) => (
                                <tr key={templateMaster._id}>
                                  <td className="table-check d-flex align-items-center justify-content-center">
                                    <input
                                      type="checkbox"
                                      checked={assetMasters.some(
                                        (item) => item._id === templateMaster._id
                                      )}
                                      onChange={() =>
                                        handleMasterRowCheckbox(
                                          templateMaster._id,
                                          templateMaster.asset_master_code
                                        )
                                      }
                                    />
                                  </td>
                                  <td>{templateMaster.asset_master_code}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="2" className="text-center">
                                  No Results Found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                ) : (
                  <p>No assets found.</p>
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
    </>
  );
};


export default AssetDragDropFlow;

