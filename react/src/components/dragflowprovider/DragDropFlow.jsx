import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import Sidebar from "./SideBar";
import CustomNode from "./CustomNode";

const initialNodes = [];
const initialEdges = [];
const nodeTypes = {
  custom: CustomNode,
};
const DragDropFlow = ({ master, nodes, setNodes, edges, setEdges }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback(
    (params) => {
      console.log("Connecting from", params.sourceHandle, "to", params.targetHandle);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
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

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const id = `${+new Date()}`;

      const newNode = {
        id,
        type: "custom",
        position,
        data: {
          label: type,
          onEdit: (nodeData) => {
            const newLabel = prompt("Edit label:", nodeData.label);
            if (newLabel !== null) {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeData.id ? { ...node, data: { ...node.data, label: newLabel } } : node
                )
              );
            }
          },
          onDelete: (nodeData) => {
            setNodes((nds) => nds.filter((node) => node.id !== id));
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );




  return (
    <div style={{ display: "flex", height: "600px" }}>
      <div style={{ zIndex: 10, position: "relative" }}>
        <Sidebar master={master} />
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
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          {/* <Controls showInteractive={false} position="top-right" /> */}

          <Background gap={12} color="#eee" variant={BackgroundVariant.Lines} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DragDropFlow;

