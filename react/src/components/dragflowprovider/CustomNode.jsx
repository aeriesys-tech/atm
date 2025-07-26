import React, { useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef();

  const handleContextMenu = (e) => {
    e.preventDefault();

    const rect = nodeRef.current.getBoundingClientRect();
    setMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setShowMenu(true);
  };


  const handleClickOutside = (e) => {
    if (nodeRef.current && !nodeRef.current.contains(e.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    setShowMenu(false);
    if (data.onEdit) data.onEdit(data); // call parent edit handler
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (data.onDelete) data.onDelete(data); // call parent delete handler
  };

  return (
    <div
      ref={nodeRef}
className="resizable-node"
      onContextMenu={handleContextMenu}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Left} id="l" />

      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.label}</div>

      <Handle type="source" position={Position.Top} id="st" />
      <Handle type="source" position={Position.Right} id="sr" />
      <Handle type="source" position={Position.Bottom} id="sb" />
      <Handle type="source" position={Position.Left} id="sl" />

      {/* Context Menu */}
      {showMenu && (
        <div
          style={{
            position: "fixed",
            top: menuPosition.y,
            left: menuPosition.x,
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 999,
            padding: "4px 0",
            width: "36px", // smaller width
          }}
        >
          <button
            style={{
              display: "block",
              width: "100%",
              background: "none",
              border: "none",
              padding: "2px 6px", // smaller padding
              fontSize: "7px", // smaller font
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "background 0.2s",
            }}
            onClick={handleEdit}
            onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
             Edit
          </button>
          <button
            style={{
              display: "block",
              width: "100%",
              background: "none",
              border: "none",
              padding: "2px 6px",
              fontSize: "7px",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "background 0.2s",
              color: "#d32f2f",
            }}
            onClick={handleDelete}
            onMouseEnter={(e) => (e.target.style.background = "#fdecea")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Delete
          </button>
        </div>
      )}



    </div>
  );

};

export default CustomNode;
