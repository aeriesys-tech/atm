import React from "react";
import Tagconfig from "../src/DQtimepages/Tagconfig";
import DBConfig from "../src/DQtimepages/DBConfig";
import SubmitJob from "../src/DQtimepages/SubmitJob";
import ReportSetting from "../src/DQtimepages/ReportSettings";
import MainLayout from "../src/components/MainLayout";
import DQConfig from "../src/DQtimepages/DQConfig";

const ProtectedRoute = [
 { path: "/main", element: <MainLayout /> },
{ path: "/tagconfig", element: <Tagconfig /> },
{ path: "/dbconfig", element: <DBConfig /> },
{ path: "/dqconfig", element: <DQConfig/> },
{ path: "/submitjob", element: <SubmitJob /> },
{ path: "/reportsettings", element: <ReportSetting /> },

];

export default ProtectedRoute;
