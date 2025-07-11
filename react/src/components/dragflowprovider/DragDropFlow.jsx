import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import Sidebar from "./SideBar";
import CustomNode from "./CustomNode";

const initialNodes = [];
const initialEdges = [];

const DragDropFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

      const newNode = {
        id: `${+new Date()}`,
        type: "custom",
        position,
        data: { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const nodeTypes = {
    custom: CustomNode,
  };

  return (
    <div style={{ display: "flex", height: "600px" }}>
      <div style={{ zIndex: 10, position: "relative" }}>
        <Sidebar />
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
          {/* <Controls /> */}
          <Controls showInteractive={false} position="top-right" />

          <Background gap={12} color="#eee" variant={BackgroundVariant.Lines} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DragDropFlow;

