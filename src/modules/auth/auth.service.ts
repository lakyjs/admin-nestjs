import { JWT_SECRET, USER_DEVICE_KEY, USER_INFO_KEY, USER_TOKEN_KEY, USER_VERSION_KEY } from '@/common/constants';
import { BusinessException } from '@/common/exceptions';
import { PrismaService } from '@/common/prisma/prisma.service';
import config from '@/config';
import { checkRedisTransactionStatus, ipToNumber } from '@/utils/common';
import { encryptPassword } from '@/utils/cryptogram';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import Redis from 'ioredis';
import { AccountLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  /**
   * 登录
   * @param account
   */
  async login(account: AccountLoginDto, request: Request) {
    const { username, password } = account;
    const deviceId = ipToNumber(request.ip);
    const userInfo = await this.prismaService.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            menus: true
          }
        }
      }
    });

    if (userInfo && userInfo?.password === encryptPassword(password, userInfo.salt)) {
      const userTokenKey = `${USER_TOKEN_KEY}:${userInfo.id}`;
      const userInfoKey = `${USER_INFO_KEY}:${userInfo.id}`;
      const userVersionKey = `${USER_VERSION_KEY}:${userInfo.id}`;
      const userDeviceKey = `${USER_DEVICE_KEY}:${userInfo.id}`;

      const userToken = await this.redis.get(userTokenKey);
      const cacheDeviceId = await this.redis.get(userDeviceKey);
      // 如果缓存中有token，并且设备id相同，直接返回token
      if (userToken && cacheDeviceId === deviceId) {
        return { token: userToken };
      }

      // 如果未登录或此账号已登录并在另一台设备登录
      const { id, username, role } = userInfo;
      let permissions = [];
      if (role.name === config.adminRole)
        permissions = ['*:*:*'];
      else permissions = userInfo.role.menus.map(item => item.code);

      const token = this.jwtService.sign(
        { id, username, version: 1 },
        {
          secret: this.configService.get(JWT_SECRET),
          expiresIn: config.tokenExpires
        }
      );

      const expireTime = config.tokenExpires;
      const transaction = this.redis.multi();
      transaction.set(userTokenKey, token, 'EX', expireTime);
      transaction.set(userInfoKey, JSON.stringify({ ...userInfo, permissions }), 'EX', expireTime);
      transaction.set(userVersionKey, 1, 'EX', expireTime);
      transaction.set(userDeviceKey, deviceId, 'EX', expireTime);
      const result = await transaction.exec();
      checkRedisTransactionStatus(result);
      return { token };
    }
    BusinessException.throwUsernameOrPasswordIncorrect();
  }

  async logout(userId: number) {
    await this.redis.del(`${USER_TOKEN_KEY}:${userId}`, `${USER_INFO_KEY}:${userId}`, `${USER_VERSION_KEY}:${userId}`, `${USER_DEVICE_KEY}:${userId}`);
  }
}
