import React from "react";
import Sidebarfield from "../../assets/icons/adjust(1)1.svg";
import dropdownicon from "../../assets/icons/ArrowLineRight.svg";
import tagIcon from "../../assets/icons/tag(2)1.svg"; 

const Sidebar = () => {
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
        <div className="accordion-item tb-accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className="accordion-button d-flex align-content-center justify-content-between"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              <div className="d-flex gap-3">
                <img src={Sidebarfield} alt="icon" />
                <p className="m-0 medium-body">Taxonomy Templates</p>
              </div>
              <img className="icon-rotate" src={dropdownicon} alt="toggle" />
            </button>
          </h2>
          <div
            id="collapseOne"
            className="accordion-collapse collapse show"
            aria-labelledby="headingOne"
            data-bs-parent="#accordionExample"
          >
            <div className="accordion-body tb-accordion-body px-3">
              <div style={gridRowStyle}>
                {["UTCL", "HIL", "Grasim", "Plant", "Line", "Section"].map((label) => (
                  <div
                    key={label}
                    draggable
                    onDragStart={(e) => onDragStart(e, label)}
                    style={boxStyle}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="accordion-item tb-accordion-item">
          <h2 className="accordion-header" id="headingTwo">
            <button
              className="accordion-button collapsed d-flex align-content-center justify-content-between"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              <div className="d-flex gap-3">
                <img src={tagIcon} alt="icon" />
                <p className="m-0 medium-body">Variable Templates</p>
              </div>
              <img className="icon-rotate" src={dropdownicon} alt="toggle" />
            </button>
          </h2>
          <div
            id="collapseTwo"
            className="accordion-collapse collapse"
            aria-labelledby="headingTwo"
            data-bs-parent="#accordionExample"
          >
            <div className="accordion-body tb-accordion-body px-3">
              <div style={gridRowStyle}>
                {[
                  "Eq.Group",
                  "Eq.Type",
                  "Eq.Sub Type",
                  "Components",
                  "Drive Types",
                  "OEM List",
                ].map((label) => (
                  <div
                    key={label}
                    draggable
                    onDragStart={(e) => onDragStart(e, label)}
                    style={boxStyle}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
