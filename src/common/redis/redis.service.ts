import config from '@/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { parse } from 'redis-info';
import { USER_INFO_KEY, USER_TOKEN_KEY, USER_VERSION_KEY } from '../constants';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) { }

  // 存储数据
  async set(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value));
  }

  // 读取数据
  async get<T = any>(key: string) {
    const value = await this.redis.get(key);
    return value as T;
  }

  async delete(key: string) {
    await this.redis.del(key);
  }

  /* 调整用户的缓存版本号，让用户重新登录 */
  async addUserVersion(userId: number) {
    return await this.redis.incr(`${USER_VERSION_KEY}:${userId}`);
  }

  async setUserToken(userId, token) {
    await this.redis
      .pipeline()
      .set(`${USER_VERSION_KEY}:${userId}`, 1)
      .set(`${USER_TOKEN_KEY}:${userId}`, token, 'EX', config.tokenExpires)
      .exec();
  }

  // 设置用户基本信息
  async setUserInfo(userId, userInfo) {
    await this.redis.set(`${USER_INFO_KEY}:${userId}`, JSON.stringify(userInfo));
  }

  // 获取用户信息
  async getUserInfo(userId) {
    const value = await this.get(`${USER_INFO_KEY}:${userId}`);
    return JSON.parse(value);
  }

  // 获取用户token
  async getUserToken(userId) {
    return await this.get(`${USER_TOKEN_KEY}:${userId}`);
  }

  // 获取用户数据版本号
  async getUserVersion(userId: number) {
    return await this.get<string>(`${USER_VERSION_KEY}:${userId}`);
  }

  /* 获取redis信息 */
  async getRedisInfo() {
    const info = await this.redis.info();
    const redisIfo = parse(info);
    const dbSize = (await this.redis.keys('*')).length;
    return {
      dbSize,
      commandStats: [
        {
          name: '缓存命中成功',
          value: redisIfo.keyspace_hits
        },
        {
          name: '缓存命中失败',
          value: redisIfo.keyspace_misses
        }
      ],
      info: redisIfo
    };
  }
}
