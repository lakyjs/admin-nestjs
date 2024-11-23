import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserListDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { CommonApiResponse } from '@/common/decorators/apiResponse';
import { PaginationPipe } from '@/common/pipes/pagination.pipe';
import { UserInfoVo } from './dto/user.vo';
import { CommonApiOperation } from '@/common/decorators/common-api-operation.dec';

@ApiTags('系统管理-用户管理')
@Controller('system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  @CommonApiOperation({ summary: '新建用户', permissionCode: 'system:user:add' })
  @CommonApiResponse()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @CommonApiOperation({ summary: '获取用户列表', permissionCode: 'system:user:list' })
  @CommonApiResponse({ type: 'array', itemType: UserInfoVo })
  findList(@Query(PaginationPipe) queryUserList: UserListDto) {
    return this.userService.findList(queryUserList);
  }
  @Get(':id')
  @ApiOperation({ summary: '根据id查询用户信息' })
  @CommonApiResponse({ type: UserInfoVo })
  findById(@Query('id') id: string) {
    console.log(+id);
    // return this.userService.findById(id);
  }
}
