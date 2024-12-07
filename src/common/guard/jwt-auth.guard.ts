import { ipToNumber } from '@/utils/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
import { BUSINESS_HTTP_CODE, IS_PUBLIC_KEY, JWT_SECRET, USER_DEVICE_KEY, USER_VERSION_KEY } from '../constants';
import { BusinessException } from '../exceptions/business.exceptions';

/**
 * jwt全局校验守卫
 *
 * 这里没有使用官方文档中的 passport-jwt 策略库来对token进行校验是为了完全控制自定义抛出异常的逻辑。
 * 而 passport-jwt 策略库会帮我们抛出401状态码的异常，且错误信息不太好控制，所以我使用的是手动自定义校验
 * 在守卫中还存在一个小问题，就是在这里抛出的异常进入到异常过滤器后从response中拿到的状态码永远是默认的 200 ，即使使用 HttpCode 自定义状态码也不生效（在中间件和守卫中表现均如此，而在其他生命周期中拿到的就是我们定义的HttpCode）
 * 为了在抛出业务层异常时，异常状态码能与我们定义的httpCode保持一致，所以使用了元数据反射拿到了 businessHttpCode 并将这个值手动保存至res.statusCode中
 * businessHttpCode 是在 DefineApi 装饰器聚合中拿到 httpCode 值并自动注入的
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  @InjectRedis()
  private readonly redis: Redis;

  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {}

  async canActivate(context: ExecutionContext) {
    // 获取request对象
    const [req, res] = context.getArgs();
    const deviceId = ipToNumber(req.ip);

    // 获取请求头中的 authorization 字段
    const token = context.switchToRpc().getData().headers.authorization?.replace('Bearer ', '');

    // 获取公开状态
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // 公开接口直接通过
    if (isPublic)
      return true;
    // 获取控制器中定义的 httpCode，在守卫中抛出异常时使用
    const httpCode = this.reflector.getAllAndOverride<number>(BUSINESS_HTTP_CODE, [
      context.getHandler(),
      context.getClass()
    ]);

    // 修改响应状态码为定义的状态码
    res.statusCode = httpCode || 200;

    // 验证token的合理性以及根据token做响应的操作
    if (token) {
      // 手动校验 token
      try {
        const jwtService = new JwtService();
        const user = jwtService.verify(token, {
          secret: this.configService.get(JWT_SECRET)
        });

        const { version } = user;
        // 已在其他设备登录，提示重新登录
        const cacheDeviceId = await this.redis.get(`${USER_DEVICE_KEY}:${user.id}`);
        if (cacheDeviceId !== null && cacheDeviceId !== deviceId) {
          throw BusinessException.throwLoginOtherDevice();
        }

        // 用户数据版本号不一致则抛出异常
        const cacheVersion = await this.redis.get(`${USER_VERSION_KEY}:${user.id}`);
        if (Number(cacheVersion) !== version)
          BusinessException.throwInvalidToken();

        // 写入对象
        req.user = user;

        return true;
      }
      catch (err) {
        this.logger.error(err);
        if (err instanceof BusinessException) {
          throw err;
        }
        BusinessException.throwInvalidToken();
      }
    }
    else {
      BusinessException.throwInvalidToken();
    }
  }
}
