import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/guard/roles.guard';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 1) // Assuming 1 is the role ID for admin
  async getUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.findOne({ _id: id });
  }
}
