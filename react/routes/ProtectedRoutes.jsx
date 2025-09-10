import Master from "../src/pages/configurations/Master";
import Dashboard from "../src/pages/Dashboard";
import RoleGroup from "../src/pages/userSettings/RoleGroups";
import Role from "../src/pages/userSettings/Roles";
import Department from "../src/pages/userSettings/Departments";
import User from "../src/pages/userSettings/user/Users";
import UserForm from "../src/pages/userSettings/user/UserForm";
import Notification from "../src/pages/utilities/Notification";
import MasterDetail from "../src/pages/configurations/MasterDetails";
import TemplateTypes from "../src/pages/templates/TemplateTypes";
import TemplateBuilder from "../src/pages/templates/TemplateBuilder";
import AssetName from "../src/pages/assets/Assets";
import AssetAttribute from "../src/pages/assets/AssetsAttributes";
import AssetBuilder from "../src/pages/assets/AssetsBuilder";
import AllAssets from "../src/pages/assets/AllAssets";
import AddEquipment from "../src/pages/assets/AddEquipment";
import ProfileSettings from "../src/pages/ProfileSetting";
import EditEquipment from "../src/pages/assets/EditEquipment";
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
		path: "/assets_attribute",
		element: <AssetAttribute />
	},
	{
		path: "/asset_add",
		element: <AssetBuilder />
	},
	{
		path: "/asset/edit/:assetId",
		element: <AssetBuilder />
	},
	{
		path: "/asset/view/:assetId",
		element: <AssetBuilder />
	},
	{
		path: "/master",
		element: <Master />
	},
	{
		path: "/masters/:masterId",
		element: <MasterDetail />
	},
	{
		path: "/roleGroup",
		element: <RoleGroup />
	},
	{
		path: "/roles",
		element: <Role />
	},
	{
		path: "/departments",
		element: <Department />
	},
	{
		path: "/users",
		element: <User />
	},
	{
		path: "/notifications",
		element: <Notification />
	},
	{
		path: "/users/add",
		element: <UserForm mode="add" />,
	},
	{
		path: "/users/edit/:id",
		element: <UserForm mode="edit" />,
	},
	{
		path: "/template/:id",
		element: <TemplateTypes />
	},
	{
		path: "/template_add",
		element: <TemplateBuilder />
	},
	{
		path: "/template/:id/edit/:templateId",
		element: <TemplateBuilder />
	},
	{
		path: "/template/:id/view/:templateId",
		element: <TemplateBuilder />
	},
	{
		path: "/all_assets",
		element: <AllAssets />
	},
	{
		path: "/add_equipment",
		element: <AddEquipment />
	},
	{
		path: "/edit-equipment/:id",
		element: <EditEquipment />
	},
	{
		path: "profile_setting",
		element: <ProfileSettings />
	}

];

export default protectedRoutes;
