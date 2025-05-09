// router/routes.js

import AccountAdd from "../views/account/AccountAdd";
import AccountCenter from "../views/account/AccountCenter";
import AccountList from "../views/account/AccountList";
import Login from "../views/login/loginView";
import AccountEdit from "../views/account/AccountEdit";
import GoodsAdd from "../views/goods/GoodsAdd";
import GoodsList from "../views/goods/GoodsList";
import GoodsType from "../views/goods/GoodsType";
import Home from "../views/home/Home";
import GoodsStatistics from "../views/statistics/GoodsStatistics";
import OrderStatistics from "../views/statistics/OrderStatistics";
import PermissionInfo from "../views/permission/PermissionInfo";
import RolePermission from "../views/permission/RolePermission";
import ShopInfo from "../views/ShopInfo";
import GoodsUpdate from "../views/goods/GoodsUpdate";
import OrderList from "../views/OrderList";

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
  { path: "/accountList", element: <AccountList />, name: '账号列表', cache: true }, // 例如：账号列表需要缓存
  { path: "/accountAdd", element: <AccountAdd />, name: '添加账号',cache: true },
  { path: "/accountCenter", element: <AccountCenter />, name: '个人信息' }, // 个人信息通常不需要缓存
  { path: "/accountEdit", element: <AccountEdit />, name: '修改密码' }, // 修改密码通常不需要缓存
  { path: "/goodsList", element: <GoodsList />, name: '商品列表', cache: true, cacheKey: 'goods-list-cache' }, // 例如：商品列表需要缓存，并指定 cacheKey
  { path: "/goodsAdd", element: <GoodsAdd />, name: '添加商品' },
  { path: "/goodsEdit/:id", element: <GoodsUpdate />, name: '修改商品' }, // 编辑页面通常不需要缓存
  { path: "/orderList", element: <OrderList />, name: '订单列表', cache: true }, // 例如：订单列表需要缓存
  { path: "/goodsType", element: <GoodsType />, name: '商品分类', cache: true }, // 商品分类列表可能需要缓存
  { path: "/statisticsGoods", element: <GoodsStatistics />, name: '商品统计' }, // 统计页面通常不需要缓存
  { path: "/statisticsOrder", element: <OrderStatistics />, name: '订单统计' }, // 统计页面通常不需要缓存
  { path: "/permissionInfo", element: <PermissionInfo />, name: '权限管理' },
  { path: "/permissionRole", element: <RolePermission />, name: '角色管理' },
  { path: "/shopInfo", element: <ShopInfo />, name: '店铺信息', cache: true }, // 店铺信息可能需要缓存
];

// 导出所有路由（用于其他地方的引用）
const routes = [...publicRoutes, ...privateRoutes];
export default routes;
