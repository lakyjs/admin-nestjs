import { NodeType } from '@prisma/client';

export const User = [
  {
    username: 'admin',
    password: 'ZN7CwACwQj0ZooEai8zyjw==',
    salt: '1118',
    nickname: 'hacxy',
    email: 'hacxy.js@outlook.com',
    roleId: 1
  }
];

export const Role = [
  {
    id: 1,
    name: 'admin',
    description: '管理员'
  }
];

export const Menu = [
  {
    id: 1,
    name: '系统管理',
    icon: 'FolderOutlined',
    code: 'system',
    type: NodeType.DIRECTORY,
    sort: 1,
    path: '/system'
  },
  {
    id: 2,
    name: '用户管理',
    icon: 'FileOutlined',
    code: 'system:user',
    type: NodeType.MENU,
    sort: 1,
    path: '/system/user',
    parentId: 1
  },
  {
    id: 3,
    name: '创建用户',
    code: 'system:user:add',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 2
  },
  {
    id: 4,
    name: '用户列表',
    code: 'system:user:list',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 2
  },
  {
    id: 5,
    name: '修改用户',
    code: 'system:user:update',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 2
  },
  {
    id: 6,
    name: '删除用户',
    code: 'system:user:delete',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 2
  },
  {
    id: 7,
    name: '角色管理',
    icon: 'FileOutlined',
    code: 'system:role',
    type: NodeType.MENU,
    path: '/system/role',
    sort: 1,
    parentId: 1
  },
  {
    id: 8,
    name: '创建角色',
    code: 'system:role:add',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 7
  },
  {
    id: 9,
    name: '角色列表',
    code: 'system:role:list',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 7
  },
  {
    id: 10,
    name: '角色修改',
    code: 'system:role:update',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 7
  },
  {
    id: 11,
    name: '删除角色',
    code: 'system:role:delete',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 7
  },
  {
    id: 12,
    name: '菜单管理',
    icon: 'FileOutlined',
    code: 'system:menu',
    type: NodeType.MENU,
    path: '/system/menu',
    sort: 1,
    parentId: 1
  },
  {
    id: 13,
    name: '创建菜单',
    code: 'system:menu:add',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 12
  },
  {
    id: 14,
    name: '菜单列表',
    code: 'system:menu:list',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 12
  },
  {
    id: 14,
    name: '修改菜单',
    code: 'system:menu:update',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 12
  },
  {
    id: 14,
    name: '删除菜单',
    code: 'system:menu:delete',
    type: NodeType.ACTION,
    sort: 1,
    parentId: 12
  }
];
