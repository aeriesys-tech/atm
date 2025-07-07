import React from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }) => {
  return (
    <div
      style={{
        width: "150px",
        padding: "10px",
        border: "1px solid #888",
        borderRadius: "5px",
        background: "#fff",
        textAlign: "center",
        wordWrap: "break-word",
      }}
    >
      {/* Target Handles */}
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Left} id="l" />

      {/* Node label */}
      <div>{data.label}</div>

      {/* Source Handles */}
      <Handle type="source" position={Position.Top} id="st" />
      <Handle type="source" position={Position.Right} id="sr" />
      <Handle type="source" position={Position.Bottom} id="sb" />
      <Handle type="source" position={Position.Left} id="sl" />
    </div>
  );
};

export default CustomNode;
