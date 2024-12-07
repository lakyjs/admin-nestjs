import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, Path } from 'nestjs-i18n';
import { Logger } from 'nestjs-pino';
import { I18nTranslations } from '../types/i18n';
import { BusinessException } from './business.exceptions';

/**
 * 异常过滤器
 */
@Catch(HttpException, Error)
export class ExeptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) { }

  catch(exception: HttpException, host: ArgumentsHost) {
    const i18n = I18nContext.current(host);
    const ctx = host.switchToHttp();
    const respones = ctx.getResponse<Response>();
    const error: any = exception.getResponse();
    this.logger.error('系统错误', exception);

    // 处理自定义业务异常
    if (exception instanceof BusinessException) {
      // const error: any = exception.getResponse();
      respones.status(HttpStatus.OK).send({
        code: error?.code,
        msg: i18n.t(error.msg, error.options) // 返回对应语言的异常信息
      });
      return;
    }

    if (exception instanceof BadRequestException) {
      let errMsg = '';
      const error: string | { [key: string]: any } = exception.getResponse();
      if (typeof error === 'string') {
        errMsg = error;
      }
      else if (Array.isArray(error.message)) {
        errMsg = error.message.shift();
      }
      else if (typeof error.message === 'string') {
        errMsg = error.message;
      }
      respones.status(HttpStatus.OK).send({
        code: HttpStatus.BAD_REQUEST,
        msg: i18n.t(errMsg) // 返回对应语言的异常信息
        // const request = ctx.getRequest<Request>();
      });
    }
    // 处理自定义业务异常
    if (exception instanceof BusinessException) {
      const error: any = exception.getResponse();
      respones.status(HttpStatus.OK).send({
        code: error?.code,
        msg: i18n.t(error.msg, error.options) // 返回对应语言的异常信息
      });
      return;
    }

    if (exception instanceof BadRequestException) {
      let errMsg = '';
      const error: string | { [key: string]: any } = exception.getResponse();
      if (typeof error === 'string') {
        errMsg = error;
      }
      else if (Array.isArray(error.message)) {
        errMsg = error.message.shift();
      }
      else if (typeof error.message === 'string') {
        errMsg = error.message;
      }
      respones.status(HttpStatus.OK).send({
        code: HttpStatus.BAD_REQUEST,
        msg: i18n.t(errMsg) // 返回对应语言的异常信息
      });
      return;
    }

    this.logger.error(exception);

    if (exception instanceof NotFoundException) {
      respones.status(HttpStatus.OK).send({
        code: HttpStatus.NOT_FOUND,
        msg: i18n.t<Path<I18nTranslations>>('exception.common.not_found')
      });
    }

    respones.status(HttpStatus.OK).send({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      msg: i18n.t<Path<I18nTranslations>>('error.common.abnormal_request')
    });
  }
}
