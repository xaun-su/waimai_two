import AccountAdd from "../views/account/AccountAdd";
import AccountCenter from "../views/account/AccountCenter";
import AccountList from "../views/account/AccountList";
import Login from "../views/login/loginView"; // 导入登录组件
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
  {
    path: "/",
    element: <Login />,
    name: 'Login',
  },
  { path: "/login", element: <Login />, name: 'Login' }, // 登录页面，不需要登录即可访问
  { path: "/home", element: <LoginHome />, name: 'Home' }, // 首页，需要登录才能访问
  { path: "/account/list", element: <AccountList />, name: 'Account List' }, // 账户列表，需要登录才能访问
  { path: "/account/add", element: <AccountAdd />, name: 'Account Add' }, // 添加账户，需要登录才能访问
  { path: "/account/center", element: <AccountCenter />, name: 'Account Center' }, // 账户中心，需要登录才能访问
  { path: "/account/edit", element: <AccountEdit />, name: 'Account Edit' }, // 编辑账户，需要登录才能访问
  { path: "/goods/list", element: <GoodsList />, name: 'Goods List' }, // 商品列表，需要登录才能访问
  { path: "/goods/add", element: <GoodsAdd />, name: 'Goods Add' }, // 添加商品，需要登录才能访问
  { path: "/goods/type", element: <GoodsType />, name: 'Goods Type' }, // 商品类型，需要登录才能访问
  { path: "/statistics/goods", element: <GoodsStatistics />, name: 'Goods Statistics' }, // 商品统计，需要登录才能访问
  { path: "/statistics/order", element: <OrderStatistics />, name: 'Order Statistics' }, // 订单统计，需要登录才能访问
  { path: "/permission/info", element: <PermissionInfo />, name: 'Permission Info' }, // 权限信息，需要登录才能访问
  { path: "/permission/role", element: <RolePermission />, name: 'Role Permission' }, // 角色权限，需要登录才能访问
  { path: "/shop/info", element: <ShopInfo />, name: 'Shop Info' }, // 店铺信息，需要登录才能访问
];

export default routes;
