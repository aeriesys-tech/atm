import React from "react";
import { ReactFlowProvider } from "reactflow";
import DragDropFlow from "./DragDropFlow";
import searchicon from '../../assets/icons/search1.svg'
import foldericon from '../../assets/icons/folder.svg'
import AssetDragDropFlow from "./assetsDragFlow/AssetsDragFlow";
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
  nodes,
  setNodes,
  edges,
  setEdges,
  selectedNodeId,
  setSelectedNodeId,
  templateDataMap,
  setTemplateDataMap,
  isViewMode,
  handleSaveNodeData,
  onConnect,
  usedHeaders,
  setUsedHeaders,
  onStructureChange,
  isAsset = false,
}) => {
  // 👇 condition to check whether to use Asset version
  const isAssetFlow = Boolean(usedHeaders && usedHeaders.size > 0);
  // Or you can use another explicit prop like `isAssetMode`
const isAssetViewMode = isAsset && isViewMode;
 const isTemplateViewMode = !isAsset && isViewMode;
   const isEffectiveEditMode = isEditMode && !isViewMode;
   const breadcrumbRoot = isAsset ? "Assets" : "Templates";
  return (
    <div className="tb-responsive templatebuilder-body">
      <div className="pt-3">
        <nav className="breadcrumb-nav show-breadcrumb" aria-label="breadcrumb">
          <h5>
           {isViewMode
              ? `View ${templateTypeName}`
              : isEffectiveEditMode
              ? `Update ${templateTypeName}`
              : `New ${templateTypeName || "Template"}`}
          </h5>

          <ol className="breadcrumb template-breadcrumb">
            <li className="breadcrumb-item">
              <a href="" onClick={(e) => e.preventDefault()}>{breadcrumbRoot}</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {templateTypeName || "Template Type"}
            </li>
          </ol>
        </nav>

        <div
          style={{ marginRight: 0, marginLeft: 0 }}
          className="row tb-header align-content-center"
        >
          <div className="col text-center">
            <div className="d-flex justify-content-between align-content-center">
              <h6 className="align-content-center">
                {templateTypeName || "-"} Builder
              </h6>
              <div className="d-flex gap-3">
               
                <div className="tb-search-div d-flex gap-3">
                 {!isAsset && isEditMode && handleSaveNodeData && (
                    <button onClick={handleSaveNodeData} className="tb-save-btn">
                      Update Node
                    </button>
                  )}
                  <img
                    src={foldericon}
                    className="tg-search-icon"
                    alt="folder icon"
                  />
                  <input
                    className="tb-search-input"
                    placeholder={`${templateTypeName || "Template"} Code`}
                    style={{ padding: "8px 35px", width: "350px" }}
                    value={templateCode}
                    onChange={(e) => setTemplateCode(e.target.value)}
                   disabled={isAssetViewMode || isTemplateViewMode}
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
                    placeholder={`${templateTypeName || "Template"} Name`}
                    style={{ padding: "8px 35px", width: "350px" }}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    ref={templateNameRef}
                    disabled={isAssetViewMode || isTemplateViewMode}
                  />
                  {isTemplateViewMode && handleSaveNodeData ? (
                    <button onClick={handleSaveNodeData} className="tb-save-btn">
                      Update Node
                    </button>
                  ) : !isAssetViewMode && (isEffectiveEditMode || !isViewMode) ? (
                    <button
                      onClick={handleSave}
                      className="tb-save-btn"
                      disabled={isAssetViewMode}
                    >
                      {isEffectiveEditMode ? 'UPDATE' : 'SAVE'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dndflow">
          <ReactFlowProvider>
            {isAsset ? (
              <AssetDragDropFlow
                master={master}
                onConnect={onConnect}
                usedTemplateTypeIds={usedTemplateTypeIds}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                selectedNodeId={selectedNodeId}
                setSelectedNodeId={setSelectedNodeId}
                templateDataMap={templateDataMap}
                setTemplateDataMap={setTemplateDataMap}
                usedHeaders={usedHeaders}
                setUsedHeaders={setUsedHeaders}
                isEditMode={isEditMode}
                templateName={templateName}
              />
            ) : (
              <DragDropFlow
                master={master}
                onConnect={onConnect}
                usedTemplateTypeIds={usedTemplateTypeIds}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                selectedNodeId={selectedNodeId}
                setSelectedNodeId={setSelectedNodeId}
                templateDataMap={templateDataMap}
                setTemplateDataMap={setTemplateDataMap}
                onStructureChange={onStructureChange}
              />
            )}
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};


export default TemplateBuilderWrapper;
