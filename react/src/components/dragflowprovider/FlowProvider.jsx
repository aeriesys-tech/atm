import React from "react";
import { ReactFlowProvider } from "reactflow";
import DragDropFlow from "./DragDropFlow";
import searchicon from '../../assets/icons/search1.svg'
import foldericon from '../../assets/icons/folder.svg'
const TemplateBuilderWrapper = ({
  master,
  usedTemplateTypeIds,
  searchQuery,
  setSearchQuery,
  templateCode,
  setTemplateCode,
  templateName,
  setTemplateName,
  handleSave,
  templateNameRef,
  ...flowProps
}) => {
  return (
    <div className="tb-responsive templatebuilder-body">
      <div className="tb-container pt-3">
        <nav className="breadcrumb-nav show-breadcrumb" aria-label="breadcrumb">
          <h5>New Asset Class</h5>
          <ol className="breadcrumb template-breadcrumb">
            <li className="breadcrumb-item">
              <a href="#">Assets</a>
            </li>
            <li className="breadcrumb-item">
              <a href="#">Asset Class</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Create
            </li>
          </ol>
        </nav>

        <div
          style={{ marginRight: 0, marginLeft: 0 }}
          className="row tb-header align-content-center"
        >
          <div className="col-md-3" style={{ width: "300px" }}>
            <div className="tb-search-div">
              <img
                src={searchicon}
                className="tg-search-icon"
                alt="search icon"
              />
              <input
                className="tb-search-input"
                placeholder="search"
                style={{ padding: "8px 35px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col text-center">
            <div className="d-flex justify-content-between align-content-center">
              <h6 className="align-content-center">Asset Builder</h6>
              <div className="d-flex gap-3">
                <div className="tb-search-div d-flex gap-3">
                  <img
                    src={foldericon}
                    className="tg-search-icon"
                    alt="folder icon"
                  />
                  <input
                    className="tb-search-input"
                    placeholder="Asset Code"
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
                    placeholder="Asset Name"
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
              {...flowProps}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilderWrapper;
