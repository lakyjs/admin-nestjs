import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY_METADATA } from '../constants';

export enum LogicalEnum {
  /* 具备任意一个 */
  or = 0,

  /* 同时具备所有 */
  and = 1
}

export type PermissionObj = {
  permissionArr: string[];
  logical: LogicalEnum;
};

export const PermissionsAuth = (permissions: string | string[], logical: LogicalEnum = LogicalEnum.or) => {
  let permissionObj: PermissionObj = {
    permissionArr: [],
    logical
  };
  if (typeof permissions === 'string') {
    permissionObj = {
      permissionArr: [permissions],
      logical
    };
  } else if (permissions instanceof Array) {
    permissionObj = {
      permissionArr: permissions,
      logical
    };
  }
  return SetMetadata(PERMISSION_KEY_METADATA, permissionObj);
};
