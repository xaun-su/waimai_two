import AccountAdd from "../views/account/AccountAdd";
import AccountCenter from "../views/account/AccountCenter";
import AccountList from "../views/account/AccountList";
import Login from "../views/loginView";
import AccountEdit from "../views/account/AccountEdit";
import GoodsAdd from "../views/goods/GoodsAdd";
import GoodsList from "../views/goods/GoodsList";
import GoodsType from "../views/goods/GoodsType";
import LoginHome from "../views/home/LoginHome";
import GoodsStatistics from "../views/statistics/GoodsStatistics";
import OrderStatistics from "../views/statistics/OrderStatistics";
import PermissionInfo from "../views/permission/PermissionInfo";
import RolePermission from "../views/permission/RolePermission";
import ShopInfo from "../views/ShopInfo";

const routes = [
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/home", element: <LoginHome /> },
  { path: "/account/list", element: <AccountList /> },
  { path: "/account/add", element: <AccountAdd /> },
  { path: "/account/center", element: <AccountCenter /> },
  { path: "/account/edit", element: <AccountEdit /> },
  { path: "/goods/list", element: <GoodsList /> },
  { path: "/goods/add", element: <GoodsAdd /> },
  { path: "/goods/type", element: <GoodsType /> },
  { path: "/statistics/goods", element: <GoodsStatistics /> },
  { path: "/statistics/order", element: <OrderStatistics /> },
  { path: "/permission/info", element: <PermissionInfo /> },
  { path: "/permission/role", element: <RolePermission /> },
  { path: "/shop/info", element: <ShopInfo /> },
];

export default routes;