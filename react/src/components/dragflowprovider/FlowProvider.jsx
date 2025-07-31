import React from "react";
import { ReactFlowProvider } from "reactflow";
import DragDropFlow from "./DragDropFlow";
import searchicon from '../../assets/icons/search1.svg'
import foldericon from '../../assets/icons/folder.svg'
const TemplateBuilderWrapper = ({
  master,
  isEditMode,
  usedTemplateTypeIds,
  templateCode,
  setTemplateCode,
  templateName,
  setTemplateName,
  handleSave,
  templateNameRef,
  templateTypeName,
  nodes,            // add these lines
  setNodes,
  edges,
  setEdges,selectedNodeId,
setSelectedNodeId,
  // ...flowProps
}) => {
  return (
    <div className="tb-responsive templatebuilder-body">
      <div className=" pt-3">
        <nav className="breadcrumb-nav show-breadcrumb" aria-label="breadcrumb">
          <h5>{isEditMode ? `Update ${templateTypeName}` : `New ${templateTypeName || "Template"}`}</h5>


          <ol className="breadcrumb template-breadcrumb">
            <li className="breadcrumb-item">
              <a href="#">Templates</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {templateTypeName || "Template Type"}
            </li>
            {/* <li className="breadcrumb-item active" aria-current="page">
              Create
            </li> */}
          </ol>
        </nav>

        <div
          style={{ marginRight: 0, marginLeft: 0 }}
          className="row tb-header align-content-center"
        >
          <div className="col text-center">
            <div className="d-flex justify-content-between align-content-center">
              <h6 className="align-content-center">Template Builder</h6>
              <div className="d-flex gap-3">
                <div className="tb-search-div d-flex gap-3">
                  <img
                    src={foldericon}
                    className="tg-search-icon"
                    alt="folder icon"
                  />
                  <input
                    className="tb-search-input"
                    placeholder="Template Code"
                    style={{ padding: "8px 35px", width: "350px" }}
                    value={templateCode}
                    onChange={(e) => setTemplateCode(e.target.value)}
                  />
                </div>
                <div className="tb-search-div d-flex gap-3">
                  <img
                    src={foldericon}
                    className="tg-search-icon"
                    alt="folder icon"
                  />
                  <input
                    className="tb-search-input"
                    placeholder="Template Name"
                    style={{ padding: "8px 35px", width: "350px" }}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    ref={templateNameRef}
                  />
                  <button onClick={handleSave} className="tb-save-btn">
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dndflow">
          <ReactFlowProvider>
            <DragDropFlow
              master={master}
              usedTemplateTypeIds={usedTemplateTypeIds}
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilderWrapper;
