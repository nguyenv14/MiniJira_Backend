import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role';
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('RolesGuard: roles', roles); // Debugging line
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('RolesGuard: user', user); // Debugging line
    return roles.includes(user.role);
  }
}
