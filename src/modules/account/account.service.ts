import { Injectable } from '@nestjs/common';
import { AccountDto } from './dto/account.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET_ENV_KEY, TOKEN_EXPIRES_ENV_KEY } from '../../constants';
import { PrismaService } from '../../common/prisma/prisma.service';
import { encryptPassword } from 'uni-nest';
import { BusinessException } from '../../exceptions/business.exceptions';

@Injectable()
export class AccountService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService
  ) {}
  async login(account: AccountDto) {
    const { username, password } = account;
    const userInfo = await this.prismaService.user.findUnique({
      where: {
        username
      }
    });

    if (userInfo && userInfo.password === encryptPassword(password, userInfo.salt)) {
      const { password, ...res } = userInfo;
      const token = this.jwtService.sign(res, {
        secret: this.configService.get(JWT_SECRET_ENV_KEY),
        expiresIn: this.configService.get(TOKEN_EXPIRES_ENV_KEY)
      });
      return { token };
    }
    BusinessException.throwUsernameOrPasswordIncorrect();
  }
}
