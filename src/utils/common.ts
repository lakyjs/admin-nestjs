import process from 'node:process';
import { BusinessException } from '@/common/exceptions';
import { I18nTranslations } from '@/common/types/i18n';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { TransformFnParams } from 'class-transformer';
import { isBoolean, isBooleanString, isEmpty, isNumber, isNumberString, ValidationArguments, ValidationOptions } from 'class-validator';
import { Address4, Address6 } from 'ip-address';
import { Path } from 'nestjs-i18n';
import { handleTree } from './format';

export function isDev() {
  return process.env.NODE_ENV === 'development';
}

export function recursiveFilter(data: { [key: string]: any } | any[], keyToFilter: string[] = []): { [key: string]: any } | any[] {
  if (Array.isArray(data)) {
    return data.map(item => recursiveFilter(item, keyToFilter));
  }
  else if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
    const result: { [key: string]: any } = {};
    for (const key in data) {
      if (!keyToFilter.includes(key)) {
        result[key] = recursiveFilter(data[key], keyToFilter);
      }
    }
    return result;
  }
  return data;
}

export async function findListData<T>(model, options: T & { tree?: boolean }, filterField?: string[]) {
  const where = (options as { [key: string]: any }).where;
  const { tree, ...resOpt } = options;
  let list = await model.findMany({
    ...resOpt
  });

  if (tree) {
    list = handleTree(list);
  }

  const total = await model.count({ where });
  return {
    list: list.map(item => recursiveFilter(item, filterField)),
    total
  };
}

export function ParseBoolean(params: TransformFnParams) {
  const { value, key: field } = params;
  if (isBoolean(value)) {
    return value;
  }
  if (isEmpty(value)) {
    return void 0;
  }
  else if (isBooleanString(value)) {
    if ([true, 'true', 1].includes(value)) {
      return true;
    }
    else if ([false, 'false', 0].includes(value)) {
      return false;
    }
  }
  else {
    BusinessException.throwError('validation.field', { args: {
      field,
      type: 'boolean'
    } });
  }
}

export function ParseInt(params: TransformFnParams) {
  const { value, key: field } = params;
  if (isEmpty(value)) {
    return void 0;
  }
  if (isNumber(value)) {
    return value;
  }
  else if (isNumberString(value)) {
    return +value;
  }
  else {
    BusinessException.throwError('validation.field', { args: {
      field,
      type: 'number'
    } });
  }
}

export function validMessage(msg: Path<I18nTranslations>, argument: ValidationArguments): string {
  BusinessException.throwError(msg, {
    args: argument
  });
  return void 0;
}
/**
 * 校验选项处理
 */
export function vali(msg?: Path<I18nTranslations>, options: ValidationOptions = {}) {
  if (msg) {
    options.message = arg => validMessage(msg, arg);
  }
  return options;
}

/**
 * 校验redis事务执行结果
 * @param results redis事务执行结果
 * @throws Error 如果事务执行失败，抛出此异常
 */
export function checkRedisTransactionStatus(results: [error: Error | null, result: unknown][] | null = []): void {
  for (const [err, result] of results) {
    if (err || result !== 'OK') {
      throw new Error('Redis事务执行失败');
    }
  }
}

/**
 * 转换IP地址为数字
 * @param ip ip地址
 * @returns IP转换后的数字
 * @throws Error 如果IP地址无效，抛出此异常
 */
export function ipToNumber(ip: string): string {
  const type = detectAddressType(ip);
  if (type === 'unknown') {
    throw new Error('Invalid IP address');
  }
  return type === 'ipv4' ? `${new Address4(ip).bigInt()}` : `${new Address6(ip).bigInt()}`;
}

function detectAddressType(address: string): 'ipv4' | 'ipv6' | 'unknown' {
  if (isIPv6Address(address)) {
    return 'ipv6';
  }
  else if (isIpv4Address(address)) {
    return 'ipv4';
  }
  else {
    return 'unknown';
  }
}

function isIPv6Address(address: string): boolean {
  return Address6.isValid(address);
}

function isIpv4Address(address: string): boolean {
  return Address4.isValid(address);
}
// export function IsMobile(validationOptions?: ValidationOptions) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       name: 'IsMobile',
//       target: object.constructor,
//       propertyName,
//       constraints: [],
//       options: validationOptions,
//       validator: {
//         validate: (value: any) => isMobileNumber(value),
//         defaultMessage: (validationArguments?: ValidationArguments) => {
//           return `${validationArguments.property}不是有效的手机号码`;
//         }
//       }
//     });
//   };
// }

export function Demo(options?: ApiPropertyOptions) {
  return applyDecorators(ApiProperty(options));
}
