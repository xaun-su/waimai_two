import AccountAdd from "../views/account/AccountAdd";
import AccountCenter from "../views/account/AccountCenter";
import AccountList from "../views/account/AccountList";
import Login from "../views/login/loginView"; // 导入登录组件
import AccountEdit from "../views/account/AccountEdit";
import GoodsAdd from "../views/goods/GoodsAdd";
import GoodsList from "../views/goods/GoodsList";
import GoodsType from "../views/goods/GoodsType";
import LoginHome from "../views/home/LoginHome";
import Home from "../views/home/Home";
import GoodsStatistics from "../views/statistics/GoodsStatistics";
import OrderStatistics from "../views/statistics/OrderStatistics";
import PermissionInfo from "../views/permission/PermissionInfo";
import RolePermission from "../views/permission/RolePermission";
import ShopInfo from "../views/ShopInfo";

// 不需要布局的路由（如登录页）
export const publicRoutes = [
  {
    path: "/",
    element: <Login />,
    name: 'Login',
  },
  { path: "/login", element: <Login />, name: 'Login' }, // 登录页面，不需要登录即可访问
];

// 需要布局的路由
export const privateRoutes = [
  { path: "/home", element: <Home />, name: '首页' },
  { path: "/account/list", element: <AccountList />, name: '账号列表' },
  { path: "/account/add", element: <AccountAdd />, name: '添加账号' },
  { path: "/account/center", element: <AccountCenter />, name: '个人信息' },
  { path: "/account/edit", element: <AccountEdit />, name: '修改密码' },
  { path: "/goods/list", element: <GoodsList />, name: '商品列表' },
  { path: "/goods/add", element: <GoodsAdd />, name: '添加商品' },
  { path: "/goods/type", element: <GoodsType />, name: '商品分类' },
  { path: "/statistics/goods", element: <GoodsStatistics />, name: '商品统计' },
  { path: "/statistics/order", element: <OrderStatistics />, name: '订单统计' },
  { path: "/permission/info", element: <PermissionInfo />, name: '权限管理' },
  { path: "/permission/role", element: <RolePermission />, name: '角色管理' },
  { path: "/shop/info", element: <ShopInfo />, name: '店铺信息' },
];

// 导出所有路由（用于其他地方的引用）
const routes = [...publicRoutes, ...privateRoutes];
export default routes;
