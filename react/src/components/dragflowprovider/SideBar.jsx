import React from "react";
import Sidebarfield from "../../assets/icons/adjust(1)1.svg";
import dropdownicon from "../../assets/icons/ArrowLineRight.svg";
import tagIcon from "../../assets/icons/tag(2)1.svg";

const Sidebar = ({ master }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      style={{
        width: "300px",
        borderRight: "1px solid #ccc",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <div className="accordion" id="accordionExample">
        {master?.map((param, idx) => (
          <div className="accordion-item tb-accordion-item" key={param?.parameterTypeId}>
            <h2 className="accordion-header" id={`heading-${idx}`}>
              <button
                className="accordion-button d-flex align-content-center justify-content-between"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${idx}`}
                aria-expanded="true"
                aria-controls={`collapse-${idx}`}
              >
                <div className="d-flex gap-3">
                  <img src={Sidebarfield} alt="icon" />
                  <p className="m-0 medium-body">{param?.parameterTypeName}</p>
                </div>
                <img className="icon-rotate" src={dropdownicon} alt="toggle" />
              </button>
            </h2>

            <div
              id={`collapse-${idx}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${idx}`}
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body tb-accordion-body px-3">
                <div style={gridRowStyle}>
                  {param.masters?.map((master) => (
                    <div
                      key={master._id}
                      draggable
                      onDragStart={(e) => onDragStart(e, master.master_name)}
                      style={boxStyle}
                    >
                      {master.master_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

const gridRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  justifyContent: "space-between",
};

const boxStyle = {
  flex: "0 0 calc(50% - 5px)",
  padding: "10px",
  backgroundColor: "#f3f3f3",
  borderRadius: "5px",
  border: "1px solid #ccc",
  cursor: "grab",
  textAlign: "center",
};

export default Sidebar;
