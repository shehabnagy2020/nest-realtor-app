import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { IUserToken } from './auth/auth.controller';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const roles: string[] = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const req = context.switchToHttp().getRequest();
    let token = req.headers.authorization;
    token = token ? token.split('Bearer ')[1] : undefined;
    if (!token) throw new HttpException('you must add token', 400);
    const user = (await jwt.decode(token)) as IUserToken;
    req.user = user;

    if (!roles.includes(user.userType))
      throw new HttpException('user type is not allowed', 400);
    return true;
  }
}
