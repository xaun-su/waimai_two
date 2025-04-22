// src/components/SideMenu.tsx
import React, { useState, useEffect } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

// 定义 Ant Design Menu items 数组中单个元素的原始类型
type AntdBaseMenuItem = Required<MenuProps>['items'][number];

// 定义我们自己的菜单项类型，它继承了 Ant Design 的基础类型，并添加了 path 和明确的 children 类型
export interface MenuItem extends AntdBaseMenuItem {
  path?: string;
  children?: MenuItem[]; // 明确 children 也是 MenuItem 数组
}

// 定义菜单项，并添加对应的路由路径 (path)
// 使用 export 关键字导出 menuItems
export const menuItems: MenuItem[] = [
  {
    key: '0',
    icon: <MailOutlined />,
    label: '首页',
    path: '/home', // 添加路径
  },
  {
    key: '1',
    icon: <MailOutlined />,
    label: '账号管理',
    path: '/accountList', // 保留父级的 path
    children: [
      { key: '11', label: '账号列表', path: '/accountList' }, // 保留子级的 path
      { key: '12', label: '添加账号', path: '/accountAdd' }, // 添加路径
      { key: '13', label: '个人信息', path: '/accountCenter' }, // 添加路径
      { key: '14', label: '修改密码', path: '/accountEdit' }, // 添加路径
    ],
  },
  {
    key: '2',
    icon: <AppstoreOutlined />,
    label: '商品管理',
    path: '/goodsList', // 保留父级的 path
    children: [
      { key: '21', label: '商品列表', path: '/goodsList' }, // 保留子级的 path
      { key: '22', label: '添加商品', path: '/goodsAdd' }, // 添加路径
      { key: '23', label: '商品分类', path: '/goodsType' }, // 添加路径
    ],
  },
  {
    key: '3',
    icon: <SettingOutlined />,
    label: '订单管理',
    path: '/orderList', 
  },
  {
    key: '4',
    icon: <SettingOutlined />,
    label: '店铺管理',
    path: '/shopInfo', // 保留 path
  },
  {
    key: '5',
    icon: <SettingOutlined />,
    label: '统计数据',
     path: '/statisticsGoods', // 保留父级 path
    children: [
      { key: '51', label: '商品统计', path: '/statisticsGoods' }, // 保留子级 path
      { key: '52', label: '订单统计', path: '/statisticsOrder' }, // 保留子级 path
    ]
  },
  {
    key: '6',
    icon: <SettingOutlined />,
    label: '权限管理',
     path: '/permissionInfo', // 保留父级 path
    children: [
      { key: '63', label: '权限管理', path: '/permissionInfo' }, // 保留子级 path
      { key: '64', label: '角色管理', path: '/permissionRole' }, // 添加路径
    ]
  }
];


interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
  path?: string;
}

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(menuItems as LevelKeysProps[]);


// 新增辅助函数：根据路径在菜单结构中查找对应的“最深层”菜单项及其所有父级菜单项
// 返回一个数组，表示从根到目标项的完整路径 (包含所有父级和目标项)
// === 添加 export 关键字 ===
export const findDeepestMenuItemPath = (
  items: MenuItem[],
  targetPath: string,
  currentPath: MenuItem[] = [] // 用于递归构建路径
): MenuItem[] | null => {
  let deepestMatch: MenuItem[] | null = null;

  for (const item of items) {
    // 构建包含当前项的新路径（如果当前项有 key，则添加到路径中）
    // 注意：这里只将有 key 的项添加到路径中，因为面包屑和菜单展开通常只基于有 key 的菜单项
    const newPath = item.key ? [...currentPath, item] : currentPath;

    // 检查当前项的 path 是否匹配目标路径
    if (item.path === targetPath) {
      // 找到了一个匹配项。这可能是一个最深层的匹配。
      deepestMatch = newPath; // 先将当前路径作为最深匹配暂存

      // 继续递归查找其子菜单，看是否有更深层的匹配
      if (item.children && item.children.length > 0) {
        const deeperMatchInChildren = findDeepestMenuItemPath(
          item.children,
          targetPath,
          newPath // 将包含当前项的路径传递给子级递归
        );
        // 如果在子级中找到了更深层的匹配，则更新 deepestMatch
        if (deeperMatchInChildren) {
          deepestMatch = deeperMatchInChildren;
        }
      }
    } else {
       // 当前项的 path 不匹配目标路径，但它可能是目标项的父级
       // 递归查找其子菜单
       if (item.children && item.children.length > 0) {
          const deeperMatchInChildren = findDeepestMenuItemPath(
              item.children,
              targetPath,
              newPath
          );
          // 如果在子级中找到了匹配项，并且这个匹配项的路径比当前找到的最深匹配更深，则更新 deepestMatch
          if (deeperMatchInChildren) {
              if (!deepestMatch || deeperMatchInChildren.length > deepestMatch.length) {
                  deepestMatch = deeperMatchInChildren;
              }
          }
       }
    }
  }
  return deepestMatch; // 返回在当前层级及其子级中找到的最深匹配路径
};


// 辅助函数：根据路径在菜单结构中查找对应的菜单项的 key
// 使用 findDeepestMenuItemPath 找到最深匹配项，然后获取其 key
// === 添加 export 关键字 ===
export const findMenuItemKeyByPath = (items: MenuItem[], targetPath: string): string | undefined => {
  const deepestPath = findDeepestMenuItemPath(items, targetPath);
  if (deepestPath && deepestPath.length > 0) {
    // 返回最深匹配项（路径数组的最后一个元素）的 key
    return deepestPath[deepestPath.length - 1].key as string;
  }
  return undefined; // 没有找到匹配项
};

// 辅助函数：根据路径在菜单结构中查找对应的菜单项的所有父级 key
// 使用 findDeepestMenuItemPath 找到最深匹配项，然后获取其所有父级的 key
// === 添加 export 关键字 ===
export const findParentKeysByPath = (items: MenuItem[], targetPath: string): string[] => {
  const deepestPath = findDeepestMenuItemPath(items, targetPath);
  if (deepestPath && deepestPath.length > 1) { // 需要至少一个父级和一个目标项
    // 返回路径数组中除了最后一个元素（目标项）之外的所有元素的 key
    // 过滤掉没有 key 的项，尽管 MenuItem 接口要求 key 存在
    return deepestPath.slice(0, -1).map(item => item.key as string).filter(key => key !== undefined);
  }
  return []; // 没有找到匹配项，或者匹配项是根级项（没有父级）
};


const SideMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路由设置默认选中的菜单项
  const defaultSelectedKey = findMenuItemKeyByPath(menuItems, location.pathname);
  const [selectedKeys, setSelectedKeys] = useState(defaultSelectedKey ? [defaultSelectedKey] : []);

  // 根据当前路由设置默认展开的父级菜单项
  const defaultOpenKeys = findParentKeysByPath(menuItems, location.pathname);
  const [openKeys, setOpenKeys] = useState(defaultOpenKeys);


  // 当路由变化时，更新选中和展开的菜单项
  useEffect(() => {
    const currentPath = location.pathname;
    const newSelectedKey = findMenuItemKeyByPath(menuItems, currentPath);
    if (newSelectedKey) {
        setSelectedKeys([newSelectedKey]);
    } else {
        setSelectedKeys([]); // 如果当前路由没有匹配的菜单项，则不选中任何项
    }

    const newOpenKeys = findParentKeysByPath(menuItems, currentPath);
     // 只更新展开项，如果当前路径在菜单中有父级，并且这些父级当前没有展开，则展开它们
     // 避免关闭用户手动展开的其他菜单项
    setOpenKeys(prevOpenKeys => {
        const keysToOpen = newOpenKeys.filter(key => !prevOpenKeys.includes(key));
        return [...prevOpenKeys, ...keysToOpen];
    });

  }, [location.pathname]); // 依赖 location.pathname，当路由变化时触发

  // 处理菜单项点击事件
  const handleMenuClick = (e: any) => {
    // 找到被点击菜单项对应的 path
    const clickedItem = findMenuItem(menuItems, e.key); // 使用导出的 menuItems
    if (clickedItem && clickedItem.path) {
      navigate(clickedItem.path);
    }
  };

  // 辅助函数：根据 key 查找菜单项 (使用导出的 menuItems)
  const findMenuItem = (items: MenuItem[], key: string): MenuItem | undefined => {
    for (const item of items) {
      // Ant Design Menu 的 key 可以是 string 或 number，这里统一转为 string 比较
      if (item && item.key && String(item.key) === String(key)) {
        return item;
      }
      if (item && item.children) {
        const found = findMenuItem(item.children as MenuItem[], key);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

   // 处理菜单展开/关闭事件 (保留原逻辑，但使用 openKeys 状态)
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
     setOpenKeys(keys as string[]); // 直接更新 openKeys 状态
  };


  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys} // 使用状态控制选中项
      openKeys={openKeys} // 使用状态控制展开项
      onOpenChange={onOpenChange} // 处理展开/关闭事件
      onClick={handleMenuClick} // 添加点击事件处理
      style={{ width: "100%", height: "100%" }}
      items={menuItems} // 使用导出的菜单配置
      theme='dark'
    />
  );
};

export default SideMenu; // 导出 SideMenu
