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
import Sidebar from "./SideBar";
import CustomNode from "./CustomNode";
import axiosWrapper from "../../../services/AxiosWrapper";
import Loader from "../general/LoaderAndSpinner/Loader";
import Select, { components } from 'react-select'
import Pagination from "../general/Pagination";
import { matchPath, useLocation } from "react-router";
const initialNodes = [];
const initialEdges = [];

const DragDropFlow = ({ master, nodes, setNodes, edges, setEdges, selectedNodeId, setSelectedNodeId, templateDataMap, setTemplateDataMap, isEditMode, isViewMode, onStructureChange }) => {
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
  const [edgeContextMenu, setEdgeContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    edgeId: null,
  });

  const { MultiValue, Option } = components;

  const getNodeStructure = useCallback(() => {
    const connectedNodes = nodes.filter((node) =>
      edges.some((edge) => edge.source === node.id || edge.target === node.id)
    );
    const unconnectedNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id)
    );
    console.log("Connected Nodes:", connectedNodes);
    console.log("Unconnected Nodes:", unconnectedNodes);
    return { connectedNodes, unconnectedNodes, edges };
  }, [nodes, edges]);

  // const onNodesChange = useCallback(
  //   (changes) => {
  //     setNodes((nds) => {
  //       const newNodes = applyNodeChanges(changes, nds);
  //       if (onStructureChange) {
  //         onStructureChange({ ...getNodeStructure(), nodes: newNodes });
  //       }
  //       return newNodes;
  //     });
  //   },
  //   [setNodes, onStructureChange, getNodeStructure]
  // );

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
        if (onStructureChange) {
          onStructureChange({ ...getNodeStructure(), edges: newEdges });
        }
        return newEdges;
      });
    },
    [setEdges, nodes, setTemplateDataMap, onStructureChange, getNodeStructure]
  );

  const onConnect = useCallback(
  (params) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    setEdges((eds) => {
      const newEdges = addEdge(
        {
          ...params,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        eds
      );
      if (onStructureChange) {
        const newStructure = {
          connectedNodes: nodes
            .filter((node) =>
              newEdges.some((edge) => edge.source === node.id || edge.target === node.id)
            )
            .map((node) => ({ ...node, draggable: true })),
          unconnectedNodes: nodes
            .filter(
              (node) => !newEdges.some((edge) => edge.source === node.id || edge.target === node.id)
            )
            .map((node) => ({ ...node, draggable: true })),
          edges: newEdges,
        };
        console.log("Updated structure on connect:", newStructure);
        onStructureChange(newStructure);
      }
      return newEdges;
    });
  },
  [nodes, setEdges, onStructureChange]
);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

const onDrop = useCallback(
  (event) => {
    event.preventDefault();
    console.log("reactFlowInstance:", reactFlowInstance);
    if (!reactFlowInstance) {
      console.error("ReactFlow instance not initialized");
      return;
    }
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    let masterData;
    try {
      masterData = JSON.parse(event.dataTransfer.getData("application/reactflow"));
    } catch (e) {
      console.error("Failed to parse masterData:", e);
      return;
    }
    console.log("Dropped masterData:", masterData);
    if (!type || !masterData.master_name) {
      console.warn("Invalid masterData:", masterData);
      return;
    }

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const id = `${+new Date()}`;
    const newNode = {
      id,
      type: "custom",
      position,
      draggable: true,
      data: {
        label: masterData.master_name,
        selected: false,
        onEdit: isViewMode ? null : (nodeData) => {
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
        onDelete: isViewMode ? null : (nodeData) => {
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
        },
        template_master_code: masterData._id,
      },
    };
    setNodes((nds) => {
      const newNodes = [...nds, newNode];
      console.log("New nodes after drop:", newNodes);
      if (onStructureChange) {
        const newStructure = {
          connectedNodes: nodes.filter((node) =>
            edges.some((edge) => edge.source === node.id || edge.target === node.id)
          ).map((node) => ({ ...node, draggable: true })),
          unconnectedNodes: [
            ...nodes.filter(
              (node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id)
            ),
            newNode,
          ].map((node) => ({ ...node, draggable: true })),
          edges,
        };
        console.log("Updated structure on drop:", newStructure);
        onStructureChange(newStructure);
      }
      return newNodes;
    });
    if (nodes.length === 0) {
      setSelectedNodeId(id);
    }
  },
  [reactFlowInstance, setNodes, setSelectedNodeId, isViewMode, nodes, edges, onStructureChange]
);

const onNodesChange = useCallback(
  (changes) => {
    console.log("Node changes:", changes); // Debug
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      console.log("New nodes after change:", newNodes); // Debug

      // Check if this includes a drag end (final position change with dragging: false)
      const isDragEnd = changes.some((change) => 
        change.type === 'position' && change.dragging === false
      );

      if (isDragEnd && onStructureChange) {
        onStructureChange({ ...getNodeStructure(), nodes: newNodes });
      }
      return newNodes;
    });
  },
  [setNodes, onStructureChange, getNodeStructure]
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

  const handleNodeDoubleClick = useCallback((node) => {
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
      setData(dataRows || []);
      setCurrentPage(resPage);
      setTotalItems(dataRows?.length || 0);
      setTotalPages(Math.ceil(totalItems / pageSize));

      const label = selectedNode?.data?.label;
      const existingTemplate = templateDataMap[label] || [];
      const selectedIds = existingTemplate.map((entry) => entry._id);

      const mappedData = dataRows.map((row) => {
        const found = existingTemplate.find((entry) => entry._id === row._id);
        let prevSelections = found?.prevSelections || row.prevSelections || {};
        return { ...row, prevSelections };
      });

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
      if (isViewMode) {
        const label = selectedNode?.data?.label;
        const existingTemplate = templateDataMap[label] || [];
        const selectedData = existingTemplate.map((item) => ({
          ...item[label],
          prevSelections: item.prevSelections || {},
        }));
        setData(selectedData);
        setCheckedItems(existingTemplate.map((item) => item._id));
      } else {
        fetchMasterData(search, statusFilter);
      }
    }
  }, [masterId, isModalOpen, currentPage, pageSize, sortBy, order, statusFilter, isViewMode, selectedNode, templateDataMap]);

  const nodeTypes = useMemo(() => ({
    custom: (nodeProps) => (
      <CustomNode {...nodeProps} onDoubleClick={handleNodeDoubleClick} />
    ),
  }), [handleNodeDoubleClick]);

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

function getAllCombinations(dataMap, currentNodeLabel) {
  const combinations = [];

  // Get all connected nodes
  const connectedNodes = nodes.filter((node) =>
    edges.some((edge) => edge.source === node.id || edge.target === node.id)
  );

  // Leaf nodes = nodes with no outgoing edge
  const leafNodes = connectedNodes.filter(
    (node) => !edges.some((edge) => edge.source === node.id)
  );

  leafNodes.forEach((leafNode) => {
    const nodeLabel = leafNode.data.label;
    const nodeData = dataMap[nodeLabel] || [];

    nodeData.forEach((row) => {
      let comboList = [
        {
          [nodeLabel]: row[nodeLabel] || row,
          _id: row._id,
          prevSelections: row.prevSelections || {},
        },
      ];

      let currentId = leafNode.id;

      // Walk up the chain
      while (currentId) {
        const node = nodes.find((n) => n.id === currentId);
        if (!node) break;

        const label = node.data.label;
        const nodeDataInner = dataMap[label] || [];

        if (nodeDataInner.length > 0) {
          // 🔥 branch combinations for each row
          comboList = comboList.flatMap((combo) =>
            nodeDataInner.map((innerRow) => ({
              ...combo,
              [label]: innerRow[label] || innerRow,
            }))
          );
        }

        const incomingEdge = edges.find((e) => e.target === currentId);
        currentId = incomingEdge?.source;
      }

      combinations.push(...comboList);
    });
  });

  // Add unconnected nodes too
  const unconnectedNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id)
  );
  unconnectedNodes.forEach((node) => {
    const label = node.data.label;
    const nodeData = dataMap[label] || [];
    nodeData.forEach((row) => {
      combinations.push({
        [label]: row[label] || row,
        _id: row._id,
        prevSelections: row.prevSelections || {},
      });
    });
  });

  return combinations;
}



  function getDisplayValue(row, label) {
    const excludedKeys = [
      "_id",
      "deleted_at",
      "status",
      "created_at",
      "updated_at",
      "__v",
      "index",
      "docId",
      "masterId",
      "prevSelections",
    ];

    const innerRow = row[label] || row;

    if (innerRow.name) return innerRow.name;
    if (innerRow.label) return innerRow.label;
    if (innerRow.documentcode) return innerRow.documentcode;

    const keys = Object.keys(innerRow).filter((k) => !excludedKeys.includes(k));
    if (keys.length === 0) return "unknown";

    const value = innerRow[keys[0]];
    return typeof value === "string" ? value : String(value);
  }

  function getDocumentCodePath(nodes, edges, comboMap, leafNodeId) {
    const path = [];
    let currentId = leafNodeId;

    while (currentId) {
      const node = nodes.find((n) => n.id === currentId);
      if (!node) break;

      const label = node.data.label;
      const selectedRow = comboMap[label];
      if (selectedRow) {
        const displayValue = getDisplayValue({ [label]: selectedRow }, label);
        path.unshift(displayValue);
      } else {
        path.unshift(label);
      }

      const incomingEdge = edges.find((e) => e.target === currentId);
      currentId = incomingEdge?.source;
    }
    return path.join("-");
  }

  function getFullLabel(combo, nodeLabel) {
    const row = combo[nodeLabel];
    const displayValue = getDisplayValue({ [nodeLabel]: row }, nodeLabel);

    if (!combo.prevSelections || Object.keys(combo.prevSelections).length === 0) {
      return displayValue;
    }

    const prevPrevLabel = Object.keys(combo.prevSelections)[0];
    const prevSel = combo.prevSelections[prevPrevLabel]?.[0];
    const prevDocCode = prevSel?.documentcode || prevSel?.label || "unknown";

    return `${prevDocCode}-${displayValue}`;
  }

  function getComboKey(combo, prevNodeLabel) {
    if (!prevNodeLabel) {
      const keys = Object.keys(combo).filter((k) => k !== "_id").sort();
      return keys.map((k) => combo[k]?._id || combo[k]).join("::");
    }
    const nodeData = combo[prevNodeLabel];
    return nodeData?._id || nodeData;
  }

const handleSaveNodeData = () => {
  const selectedRows = data.filter((row) => checkedItems.includes(row._id));
  const label = selectedNode?.data?.label;

  if (!label || selectedRows.length === 0 || !masterData?.master?.masterFields) return;

  setTemplateDataMap((prev) => {
    const newMap = {
      ...prev,
      [label]: selectedRows.map((row) => ({
        [label]: row,
        _id: row._id,
        prevSelections: row.prevSelections || {},
      })),
    };

    const combinations = getAllCombinations(newMap, label);
    const allPaths = new Set(prev.document_code || []);

    const connectedNodes = nodes.filter((node) =>
      edges.some((edge) => edge.source === node.id || edge.target === node.id)
    );
    const leafNodes = connectedNodes.filter(
      (node) => !edges.some((edge) => edge.source === node.id)
    );

    leafNodes.forEach((leafNode) => {
      combinations
        .filter((combo) => Object.keys(combo).includes(leafNode.data.label))
        .forEach((combo) => {
          const docCode = getDocumentCodePath(nodes, edges, combo, leafNode.id);
          allPaths.add(docCode);
        });
    });

    const unconnectedNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id)
    );
    unconnectedNodes.forEach((node) => {
      const nodeLabel = node.data.label;
      const nodeData = newMap[nodeLabel] || [];
      nodeData.forEach((row) => {
        const displayValue = getDisplayValue({ [nodeLabel]: row[nodeLabel] || row }, nodeLabel);
        allPaths.add(displayValue);
      });
    });

    const updatedMap = {
      ...newMap,
      document_code: Array.from(allPaths),
    };

    // Update nodes with selectedData from updatedMap for all nodes
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selectedData: updatedMap[node.data.label] || node.data.selectedData || [],
        },
      }))
    );

    // Update templateStructure via onStructureChange
    if (onStructureChange) {
      const newStructure = {
        connectedNodes: nodes
          .filter((node) =>
            edges.some((edge) => edge.source === node.id || edge.target === node.id)
          )
          .map((node) => ({
            ...node,
            draggable: true,
            data: {
              ...node.data,
              selectedData: updatedMap[node.data.label] || node.data.selectedData || [],
            },
          })),
        unconnectedNodes: nodes
          .filter(
            (node) => !edges.some((edge) => edge.source === node.id || edge.target === node.id)
          )
          .map((node) => ({
            ...node,
            draggable: true,
            data: {
              ...node.data,
              selectedData: updatedMap[node.data.label] || node.data.selectedData || [],
            },
          })),
        edges,
      };
      console.log("Updated structure in handleSaveNodeData:", newStructure);
      onStructureChange(newStructure);
    }

    return updatedMap;
  });

  setData((prevData) =>
    prevData.map((row) => ({
      ...row,
      prevSelections: row.prevSelections || {},
    }))
  );

  setIsModalOpen(false);
};

  const getPreviousNode = (currentNodeId) => {
    const incomingEdge = edges.find((edge) => edge.target === currentNodeId);
    if (!incomingEdge) return null;
    const sourceNode = nodes.find((node) => node.id === incomingEdge.source);
    console.log("Previous Node:", sourceNode);
    return sourceNode;
  };

  const prevNode = selectedNode ? getPreviousNode(selectedNode.id) : null;
  const prevNodeLabel = prevNode?.data?.label;

  const previousCombinations = useMemo(() => {
    const prevNodeData = templateDataMap[prevNodeLabel] || [];
    return prevNodeData.map((row) => ({
      [prevNodeLabel]: row[prevNodeLabel] || row,
      _id: row._id,
      prevSelections: row.prevSelections || {},
    }));
  }, [templateDataMap, prevNodeLabel]);

  const uniqueComboKeys = new Set();
  const deduplicatedCombinations = [];

  previousCombinations.forEach((combo) => {
    const key = getComboKey(combo, prevNodeLabel);
    if (!uniqueComboKeys.has(key)) {
      uniqueComboKeys.add(key);
      deduplicatedCombinations.push(combo);
    }
  });

  const CheckboxOption = (props) => {
    const { data, innerRef, innerProps, selectProps } = props;
    const selectedValues = selectProps.value || [];
    const isSelectAll = data.value === "__select_all__";
    const allOptions = selectProps.options.filter((opt) => opt.value !== "__select_all__");
    const isAllSelected =
      selectedValues.length === allOptions.length &&
      allOptions.every((opt) => selectedValues.find((val) => val.value === opt.value));
    const isChecked = isSelectAll
      ? isAllSelected
      : selectedValues.some((val) => val.value === data.value);

    return (
      <div ref={innerRef} {...innerProps} style={{ padding: "5px 10px" }}>
        <input
          type="checkbox"
          style={{ width: "16px", height: "16px", marginRight: "8px" }}
          checked={isChecked}
          readOnly
        />
        {isSelectAll ? <strong>Select All</strong> : data.label}
      </div>
    );
  };

  const MultiValueLabel = (props) => (
    <components.MultiValue {...props}>
      <span>{props.data.label}</span>
    </components.MultiValue>
  );

  const optionsWithSelectAll = [
    { value: "__select_all__", label: "Select All" },
    ...deduplicatedCombinations.map((combo) => ({
      value: getComboKey(combo, prevNodeLabel),
      label: getFullLabel(combo, prevNodeLabel) || "Unnamed Combination",
      fullData: combo,
    })),
  ].filter((option) => option.label !== "");

  return (
    <>
      <div style={{ display: "flex", height: "600px" }}>
        <div style={{ zIndex: 10, position: "relative" }}>
          <Sidebar master={master} usedTypes={nodes.map((n) => n.data.label)} />
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
            nodesDraggable={true}
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
      {isModalOpen && (
        <div className="modal-overlay1" onClick={() => setIsModalOpen(false)}>
          <div className="addunit-card2" onClick={(e) => e.stopPropagation()}>
            {loading && (
              <div className="loader-overlay d-flex justify-content-center align-items-center">
                <Loader />
              </div>
            )}
            <div className="addunit-header d-flex justify-content-between align-items-center p-3">
              <h4>{masterData?.master?.display_name_singular || "Loading..."}</h4>
              <a onClick={() => setIsModalOpen(false)} style={{ cursor: "pointer" }}>
                <img
                  src="src/assets/icons/close.svg"
                  width="28px"
                  height="28px"
                  alt="Close"
                />
              </a>
            </div>
            <div className="mt-2 me-3 ms-3">
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div
                    className="table-responsive scrollable-table"
                    style={{ display: "flex", flexDirection: "column", height: "580px" }}
                  >
                    <table className="table bg-white align-middle table-text">
                      <thead className="table-head align-middle">
                        <tr>
                          {!isViewMode && (
                            <th className="table-check">
                              <input
                                type="checkbox"
                                checked={data.length > 0 && checkedItems.length === data.length}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  const allIds = isChecked ? data.map((item) => item._id) : [];
                                  setCheckedItems(allIds);
                                }}
                              />
                            </th>
                          )}
                          <th className="col">#</th>
                          {data.length > 0 &&
                            masterData?.master?.masterFields?.map((field) => (
                              <th className="col text-uppercase" key={field._id}>
                                {field.display_name}
                              </th>
                            ))}
                          {prevNodeLabel && (
                            <th className="col text-uppercase">Select {prevNodeLabel}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, idx) => (
                          <tr key={row._id} className={row.status ? "" : "text-muted"}>
                            {!isViewMode && (
                              <td className="table-check">
                                <input
                                  type="checkbox"
                                  checked={checkedItems.includes(row._id)}
                                  onChange={() => {
                                    if (checkedItems.includes(row._id)) {
                                      setCheckedItems((prev) => prev.filter((id) => id !== row._id));
                                    } else {
                                      setCheckedItems((prev) => [...prev, row._id]);
                                    }
                                  }}
                                />
                              </td>
                            )}
                            <td className="col">{idx + 1}</td>
                            {masterData?.master?.masterFields?.map((field) => (
                              <td key={field._id}>
                                {field.field_name in row
                                  ? row[field.field_name]
                                  : row.attributes?.[field.field_name] ?? "-"}
                              </td>
                            ))}
                            {prevNodeLabel && (
                              <td className="custom-select-container">
                                {isViewMode ? (
                                  <div>
                                    {(row.prevSelections?.[prevNodeLabel] || []).map((sel, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          background: "#e0f0ff",
                                          borderRadius: "12px",
                                          padding: "2px 6px",
                                          margin: "2px",
                                          display: "inline-block",
                                        }}
                                      >
                                        {sel.documentcode || sel.label}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <Select
                                    isMulti
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    components={{ Option: CheckboxOption, MultiValue: MultiValueLabel }}
                                    value={
                                      (row.prevSelections?.[prevNodeLabel] || []).map((item) => ({
                                        value: item.id,
                                        label: item.documentcode || item.label,
                                        fullData: deduplicatedCombinations.find((c) => getComboKey(c, prevNodeLabel) === item.id),
                                      }))
                                    }
                                    onChange={(selectedOptions, { action, option }) => {
                                      const isSelectAllOption = option?.value === "__select_all__";
                                      if (isSelectAllOption) {
                                        const selectedItems = row.prevSelections?.[prevNodeLabel] || [];
                                        const allOptions = optionsWithSelectAll.filter((opt) => opt.value !== "__select_all__");
                                        const allSelected =
                                          selectedItems.length === allOptions.length &&
                                          allOptions.every((opt) => selectedItems.some((sel) => sel.id === opt.value));
                                        setData((prevData) =>
                                          prevData.map((r) =>
                                            r._id === row._id
                                              ? {
                                                  ...r,
                                                  prevSelections: {
                                                    ...(r.prevSelections || {}),
                                                    [prevNodeLabel]: allSelected
                                                      ? []
                                                      : allOptions.map((opt) => ({
                                                          id: opt.value,
                                                          label: opt.label,
                                                          documentcode: opt.label,
                                                        })),
                                                  },
                                                }
                                              : r
                                          )
                                        );
                                        return;
                                      }
                                      const selectedItems = (selectedOptions || [])
                                        .filter((opt) => opt.value !== "__select_all__")
                                        .map((opt) => ({
                                          id: opt.value,
                                          label: opt.label,
                                          documentcode: opt.label,
                                        }));
                                      setData((prevData) =>
                                        prevData.map((r) =>
                                          r._id === row._id
                                            ? {
                                                ...r,
                                                prevSelections: {
                                                  ...(r.prevSelections || {}),
                                                  [prevNodeLabel]: selectedItems,
                                                },
                                              }
                                            : r
                                        )
                                      );
                                    }}
                                    options={optionsWithSelectAll}
                                    placeholder="Select connection(s)"
                                    styles={{
                                      control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: "white",
                                        borderColor: state.isFocused ? "#007BFF" : "#CED4DA",
                                        boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : null,
                                        "&:hover": { borderColor: "#007BFF" },
                                        minHeight: "32px",
                                      }),
                                      option: (provided, state) => ({
                                        ...provided,
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                        height: "30px",
                                        backgroundColor: state.isSelected ? "#ffffff" : state.isFocused ? "#E9ECEF" : null,
                                        color: "black",
                                        "&:hover": { backgroundColor: "#E9ECEF" },
                                      }),
                                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                                      menu: (base) => ({ ...base, zIndex: 99999 }),
                                      multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor: "#e0f0ff",
                                        borderRadius: "12px",
                                        padding: "0 4px",
                                        fontSize: "12px",
                                      }),
                                      multiValueLabel: (provided) => ({
                                        ...provided,
                                        fontWeight: 500,
                                      }),
                                    }}
                                  />
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="addunit-card-footer" style={{ position: "absolute", bottom: 0 }}>
              <button
                type="button"
                className="discard-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              {!isViewMode && (
                <button onClick={handleSaveNodeData} className="update-btn">
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default DragDropFlow;

