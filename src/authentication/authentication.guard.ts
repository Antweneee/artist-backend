import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Request } from 'express';

import { JwtPayload } from './contracts/JwtPayload.interface';
import { PrismaService } from '../prisma/prisma.service';

/*
|--------------------------------------------------------------------------
| Authentication guard
|--------------------------------------------------------------------------
*/

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();

      const authorization: string = request.headers['authorization'];

      let token: string = "";

      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.split(' ')[1];
      }

      if (!token) {
        throw new UnauthorizedException(); 
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(
        token,
        { secret: process.env.JWT_SECRET },
      );

      const requiredRoles =
        this.reflector.get<Role[]>('roles', context.getHandler()) || [];

      const userRoles = await this.checkRoles(requiredRoles, payload.sub);

      if (
        await this.prisma.revokedToken.findUnique({
          where: { jti: payload.jti },
        })
      ) {
        throw new UnauthorizedException();
      }

      request.user = { ...payload, roles: userRoles };

      return true;
    } catch (err: unknown) {
      throw new UnauthorizedException();
    }
  }

  private async checkRoles(requiredRoles: Role[], userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (!user) throw new UnauthorizedException();

    for (const role of requiredRoles) {
      if (!user.roles.includes(role)) throw new UnauthorizedException();
    }

    return user;
  }
}
