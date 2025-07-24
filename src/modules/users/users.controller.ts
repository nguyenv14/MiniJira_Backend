import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/guard/roles.guard';
import { RoleInWeb } from 'src/utils/role';
import { UserSearchRequest } from '../../dto/UserSearchRequest'
import { BaseResponse } from 'src/utils/base-response';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleInWeb.ADMIN, RoleInWeb.LEADER) // Assuming 1 is the role ID for admin
  async getUsers(
    @Body() userSearchRequest: UserSearchRequest
  ) {
    return this.userService.findAll(userSearchRequest);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.findOne({ _id: id });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleInWeb.ADMIN) // Nếu bạn muốn chỉ admin được quyền xóa
  deleteUser(@Param('id') id: string) {
    this.userService.deleteUser(id);
    return new BaseResponse(200, 'Delete User success!', null);
  }
}
