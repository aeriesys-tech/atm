import React from "react";
import Layout from "../layout/Layout";
import Dropdown from "../components/common/Dropdown";
import Menubar from "../components/common/Menubar";
import Headertext from "../components/common/Headertext";

function TagConfiguration() {
  const header = (
    <div className="flex items-center justify-between md:mx-10 py-2">
      <Headertext Text="Dashboard" />
    </div>
  );

  return (
    <Layout header={header}>
      <h1 className="text-2xl text-gray-800 font-semibold">Dashboard</h1>
    
    </Layout>
  );
}

export default TagConfiguration;
