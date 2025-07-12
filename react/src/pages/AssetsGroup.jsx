import React, { useState, useRef } from "react";
import Header from "../components/general/Header";
import Footer from "../components/general/Footer";
// import Breadcrum from "../components/Breadcrum";
// import SubMenu from "../components/SubMenu";
import TemplateBuilderWrapper from "../components/dragflowprovider/FlowProvider";

const AssetName = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [templateCode, setTemplateCode] = useState("");
  const [templateName, setTemplateName] = useState("");
  const templateNameRef = useRef();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: {}, nodeId: null });
  const [edgeLabelModal, setEdgeLabelModal] = useState({ isOpen: false, label: "", edgeId: null });

  const handleSave = () => {
    console.log("Saving Template", { templateName, templateCode });
  };

  return (
    <>
      <div >


        <TemplateBuilderWrapper
          master={{}}
          usedTemplateTypeIds={[]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          templateCode={templateCode}
          setTemplateCode={setTemplateCode}
          templateName={templateName}
          setTemplateName={setTemplateName}
          templateNameRef={templateNameRef}
          handleSave={handleSave}
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          edgeLabelModal={edgeLabelModal}
          setEdgeLabelModal={setEdgeLabelModal}
        />
      </div>
    </>
  );
};

export default AssetName;
