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

const AssetDragDropFlow = ({ master, nodes, setNodes, edges, setEdges, selectedNodeId, setSelectedNodeId, templateDataMap, setTemplateDataMap, usedHeaders,
  setUsedHeaders,isEditMode}) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [masterData, setMasterData] = useState({});
  const [masterId, setMasterId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("true");
  const [checkedItems, setCheckedItems] = useState([]);
  const { MultiValue, Option } = components;
  const location = useLocation();
  const [edgeContextMenu, setEdgeContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    edgeId: null,
  });

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
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
            // label: `${sourceNode?.data?.label || params.source} ➝ ${targetNode?.data?.label || params.target}`,
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

    // Restrict one node per header
    const headerId = masterData.parameterTypeId?._id || masterData.template_type_id;
    if (usedHeaders.has(headerId)) {
      // alert(`You can only drag one node from "${masterData.template_type_name || masterData.master_name}" header.`);
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

          // Free up the header so it can be dragged again
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

    // Mark this header as used
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
  const handleNodeDoubleClick = useCallback((node) => {
      const isViewRoute = matchPath(
    { path: "/asset/view/:assetId" },
    location.pathname
  );

  if (!isViewRoute) {
    // Not in view mode → do nothing or handle differently
    return;
  }
    console.log("Double click node", node);
    const masterIdFromNode = node?.data?.template_master_code;
    if (!masterIdFromNode) return;

    setSelectedNode(node);
    setMasterId(masterIdFromNode);
    setIsModalOpen(true);
  }, []);
  const fetchMasterData = async (searchVal = search, statusVal = statusFilter) => {
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

      const { masterData, currentPage: resPage, totalPages } = response.data;
      const dataRows = response?.data;

      setMasterData(response);
      setData(response?.data || []);
      setCurrentPage(resPage);
      setTotalItems(response?.data?.length);
      setTotalPages(Math.ceil(totalItems / pageSize));

      const label = selectedNode?.data?.label;
      const existingTemplate = templateDataMap[label] || [];
      const selectedIds = existingTemplate.map((entry) => entry._id);

      const mappedData = dataRows.map((row) => {
        const found = existingTemplate.find((entry) => entry._id === row._id);
        let prevSelections = found?.prevSelections || row.prevSelections || {};

        return {
          ...row,
          prevSelections,
        };
      });

      console.log("Fetched Master Data:", mappedData); // Debug log
      setCheckedItems(selectedIds);
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching master detail:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && masterId) {
      fetchMasterData(search, statusFilter);
    }
  }, [masterId, isModalOpen, currentPage, pageSize, sortBy, order, statusFilter]);
  const nodeTypes = useMemo(() => ({
    custom: (nodeProps) => (
      <AssetsCustomNode
        {...nodeProps}
        onDoubleClick={handleNodeDoubleClick}
      />
    )
  }), [handleNodeDoubleClick]);
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'; // prevent background scroll
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  return (
    <>
      <div style={{ display: "flex", height: "600px" }}>
        <div style={{ zIndex: 10, position: "relative" }}>
          <AssetSidebar master={master} usedTypes={nodes.map(n => n.data.label)}  usedHeaders={usedHeaders} isEditMode={isEditMode}/>
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
              console.log("Edge clicked:", edge);
              const bounds = reactFlowWrapper.current.getBoundingClientRect();
              setEdgeContextMenu({
                isOpen: true,
                position: {
                  x: event.clientX - bounds.left,
                  y: event.clientY - bounds.top,
                },
                edgeId: edge.id,
                label: edge.label || '',
              });
            }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { pointerEvents: 'auto' },
              labelStyle: { pointerEvents: 'none' }, 
            }}

            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            {/* <Controls showInteractive={false} position="top-right" /> */}

            <Background gap={12} color="#eee" variant={BackgroundVariant.Lines} />
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
                        edge.id === edgeContextMenu.edgeId
                          ? { ...edge, label: newLabel }
                          : edge
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
                  setEdges((eds) =>
                    eds.filter((edge) => edge.id !== edgeContextMenu.edgeId)
                  );
                  setEdgeContextMenu({ isOpen: false, position: {}, edgeId: null });
                }}
              >
                Delete Edge
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssetDragDropFlow;

