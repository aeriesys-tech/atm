import React, { useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";

const AssetsCustomNode = ({ data, id, onDoubleClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const nodeRef = useRef();
    const isSelected = data.selectedNodeId === id;

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
       if (data.onEdit) data.onEdit({ id, data });
    };

    const handleDelete = () => {
        setShowMenu(false);
        if (data.onDelete) data.onDelete({ ...data, id });
    };

const handleAddSpecification = () => {
    setShowMenu(false);
    if (data.onAddSpecification) data.onAddSpecification({ id, data });
};

const handleViewSpecification = () => {
    setShowMenu(false);
    if (data.onViewSpecification) data.onViewSpecification({ id, data });
};


    return (
        <div
            ref={nodeRef}
            className="resizable-node"
            onContextMenu={handleContextMenu}
            onDoubleClick={() => onDoubleClick && onDoubleClick({ id, data })}
        >
            <div
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color:  "black",
                }}
            >
                {data.label}
            </div>

            {/* Handles */}
            {data.label === "Asset Class" ? (
                <>
                    <Handle type="target" position={Position.Top} id="target-top" />
                    <Handle type="target" position={Position.Right} id="target-right" />
                    <Handle type="target" position={Position.Bottom} id="target-bottom" />
                    <Handle type="target" position={Position.Left} id="target-left" />

                    <Handle type="source" position={Position.Top} id="source-top" />
                    <Handle type="source" position={Position.Right} id="source-right" />
                    <Handle type="source" position={Position.Bottom} id="source-bottom" />
                    <Handle type="source" position={Position.Left} id="source-left" />
                </>
            ) : (
                <>
                    <Handle type="target" position={Position.Right} id="r" />
                    <Handle type="target" position={Position.Left} id="l" />
                    <Handle type="source" position={Position.Right} id="sr" />
                    <Handle type="source" position={Position.Left} id="sl" />
                </>
            )}

            {/* Context Menu */}
            {showMenu && data.label !== "Asset Class" && (
                <div
                    className="edit-cont"
                    style={{
                        position: "absolute",
                        top: menuPosition.y,
                        left: menuPosition.x,
                        zIndex: 999,
                        width: "77px",
                    }}
                >
                    <button
                        style={{
                            width: "100%",
                            fontSize: "7px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            transition: "background 0.2s",
                        }}
                        className="edit-btn"
                        onClick={handleEdit}
                    >
                        Configuration
                    </button>
                    <button
                        style={{
                            width: "100%",
                            fontSize: "7px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            transition: "background 0.2s",
                        }}
                        className="edit-btn"
                        onClick={handleAddSpecification}
                    >
                        Add Specification
                    </button>
                    <button
                        style={{
                            width: "100%",
                            fontSize: "7px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            transition: "background 0.2s",
                        }}
                        className="edit-btn"
                        onClick={handleViewSpecification}
                    >
                        View Specification
                    </button>
                    <button
                        style={{
                            width: "100%",
                            fontSize: "7px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            transition: "background 0.2s",
                        }}
                        className="delete-btn"
                        onClick={handleDelete}
                    >
                        Delete Node
                    </button>
                </div>
            )}
        </div>
    );
};


export default AssetsCustomNode;
