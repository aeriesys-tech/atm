import React, { useCallback, useEffect, useRef, useState } from "react";
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

const initialNodes = [];
const initialEdges = [];
const nodeTypes = {
  custom: CustomNode,
};
const DragDropFlow = ({ master, nodes, setNodes, edges, setEdges, selectedNodeId, setSelectedNodeId }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    edgeId: null,
  });

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
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
      if (!type) return;

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
          label: type,
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

              // Set selected node
              setSelectedNodeId(nextSelectedId);

              // Update nodes with new selection
              return filtered.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  selectedNodeId: nextSelectedId,
                },
              }));
            });

            setEdges((prevEdges) =>
              prevEdges.filter(
                (edge) => edge.source !== nodeData.id && edge.target !== nodeData.id
              )
            );
          },
        },
      };
      setNodes((nds) => nds.concat(newNode));
      // Safe way to set selectedNodeId outside render/update phase
      if (nodes.length === 0) {
        setSelectedNodeId(id);
      }
    },
    [reactFlowInstance, setNodes, selectedNodeId]
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


  return (
    <div style={{ display: "flex", height: "600px" }}>
      <div style={{ zIndex: 10, position: "relative" }}>
        <Sidebar master={master} usedTypes={nodes.map(n => n.data.label)} />
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
    labelStyle: { pointerEvents: 'none' }, // label shouldn't block clicks
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
  );
};

export default DragDropFlow;

