import Master from "../src/pages/configurations/Master";
import AssetName from "../src/pages/AssetsGroup";
import Dashboard from "../src/pages/Dashboard";
import Role from "../src/pages/userSettings/Roles";

const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/assets",
    element: <AssetName />
  },
  {
    path: "/master",
    element: <Master />
  },
  {
    path: "/role",
    element: <Role />
  }
];

export default protectedRoutes;
