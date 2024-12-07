import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Path, TranslateOptions } from 'nestjs-i18n';
import { I18nTranslations } from '../types/i18n';
import { BusinessError, CODE_LOGIN_OTHER_DEVICE } from './constants';

/**
 * 自定义业务异常
 */
export class BusinessException extends HttpException {
  constructor(err?: BusinessError) {
    // 处理公共错误
    super(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * 抛出客户端异常
   */
  static throwError(msg: Path<I18nTranslations>, options?: TranslateOptions) {
    throw new BusinessException({
      msg,
      code: HttpStatus.BAD_REQUEST,
      options
    });
  }

  /**
   * 角色无操作权限
   */
  static throwNoPermissionToOperate() {
    throw new BusinessException({
      code: HttpStatus.FORBIDDEN,
      msg: 'error.auth.no_operational_permissions'
    });
  }

  /**
   * 无效token或已过期
   */
  static throwInvalidToken() {
    throw new BusinessException({
      code: HttpStatus.UNAUTHORIZED,
      msg: 'error.auth.invalid_token'
    });
  }

  /**
   * 用户不存在
   */
  static throwUserNotExist() {
    throw new BadRequestException('error.user.user_not_exist');
  }

  /**
   * 账号或密码错误
   */
  static throwUsernameOrPasswordIncorrect(): void {
    throw new BadRequestException('error.user.username_or_password_incorrect');
  }

  /**
   * 修改密码时旧的密码验证错误
   */
  static throwOldPasswordIncorrect() {
    throw new BadRequestException('error.profile.old_password_incorrect');
  }

  /**
   * 角色名重复
   */
  static throwRoleNameExist() {
    throw new BadRequestException('error.role.role_name_exist');
  }

  // 演示环境禁止操作
  static throwDemoEnvForbidden() {
    throw new BadRequestException('error.common.demo_env_forbidden');
  }

  // 角色正在使用
  static throwRoleInUse() {
    throw new BadRequestException('error.role.role_in_use');
  }

  // 角色不存在
  static throwRoleNotExist() {
    throw new BadRequestException('error.role.role_not_exist');
  }

  static throwLoginOtherDevice() {
    return new BusinessException({ msg: 'error.user.login_other_device', code: CODE_LOGIN_OTHER_DEVICE });
  }
}
