import React from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "./MainLayout";

const SettingLayout = ({ children }) => {
  const location = useLocation();

  return (
    <>
      <div className="content-body pd-0">
        <div className="settings-wrapper settings-wrapper-two">
          <div className="settings-sidebar">
            <div className="settings-sidebar-header">
              <div className="dropdown-link">
                <div className="d-flex align-items-center">
                  <span className="tx-color-01 tx-semibold">Configurations</span>
                </div>
                <span>
                  <i data-feather="settings" />
                </span>
              </div>
            </div>
            <div className="settings-sidebar-body">
              <div className="pd-t-20 pd-b-10 pd-x-10">
                <label className="tx-sans tx-uppercase tx-medium tx-10 tx-spacing-1 tx-color-03 pd-l-10">
                  Configurations
                </label>
                <nav className="nav nav-sidebar tx-13">
                  {[
                    { path: "/configurations/organizations", icon: "codesandbox", label: "Organizations" },
                    { path: "/configurations/clusters", icon: "trello", label: "Clusters" },
                    { path: "/configurations/departments", icon: "folder", label: "Departments" },
                    { path: "/configurations/designations", icon: "monitor", label: "Designations" },
                    { path: "/configurations/divisions", icon: "pie-chart", label: "Divisions" },
                    { path: "/configurations/document_types", icon: "layers", label: "Document Types" },
                    { path: "/configurations/events", icon: "clock", label: "Events" },
                    { path: "/configurations/expense_categories", icon: "dollar-sign", label: "Expense Category" },
                    { path: "/configurations/holidays", icon: "globe", label: "Holidays" },
                    { path: "/configurations/headquarter", icon: "life-buoy", label: "Headquarters" },
                    { path: "/configurations/pages", icon: "box", label: "Pages" },
                    { path: "/configurations/places", icon: "trello", label: "Places" },
                    { path: "/configurations/prices", icon: "shield", label: "Prices" },
                    { path: "/configurations/roles", icon: "file-text", label: "Roles" },
                    { path: "/configurations/specialities", icon: "package", label: "Specialities" },
                    { path: "/configurations/transportation_types", icon: "image", label: "Transportation Types" }
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                    >
                      <i data-feather={item.icon} /> <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <div className="settings-sidebar-footer"></div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default SettingLayout;
