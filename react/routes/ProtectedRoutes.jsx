import Master from "../src/pages/configurations/Master";
import AssetName from "../src/pages/AssetsGroup";
import Dashboard from "../src/pages/Dashboard";
import RoleGroup from "../src/pages/userSettings/RoleGroups";
import Role from "../src/pages/userSettings/Roles";
import Department from "../src/pages/userSettings/Departments";
import User from "../src/pages/userSettings/user/Users";
import UserForm from "../src/pages/userSettings/user/UserForm";

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
    path: "/roleGroup",
    element: <RoleGroup/>
  },
    {
    path: "/roles",
    element: <Role/>
  },
   {
    path: "/departments",
    element: <Department/>
  },
  {
    path: "/users",
    element: <User/>
  },
    {
        path: "/users/add",
        element: <UserForm mode="add" />,
      },
      {
        path: "/users/edit/:id",
        element: <UserForm mode="edit" />,
      }
];

export default protectedRoutes;
