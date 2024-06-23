import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { InvalidCredentials } from '../errors/InvalidCredentials';
import { handleErrors } from '../utils/handle-errors';
import { AuthGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { SignInOAuthDto } from './dto/sign-in-oauth.dto';

// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('Auth')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-up')
  async signUp(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { user, tokens } = await this.authService.signUp(body);

      res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
      res.setHeader('x-refresh-token', tokens.refreshToken);

      return { user };
    } catch (err: unknown) {
      handleErrors(err);
    }
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { user, tokens } = await this.authService.signIn(body);

      res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
      res.setHeader('x-refresh-token', tokens.refreshToken);

      return { user };
    } catch (err: unknown) {
      handleErrors(err);
    }
  }

  @Post('signInOAuth')
  @HttpCode(200)
  async signInOAuth(
    @Body() body: SignInOAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { user, tokens } = await this.authService.signInAuth(body);

      res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
      res.setHeader('x-refresh-token', tokens.refreshToken);

      return { user };
    } catch(err) {
      handleErrors(err)
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {

      const token = await this.authService.refreshTokens(req.user.sub)
      
      res.setHeader('x-refresh-token', token);

    } catch (err: unknown) {
      if (err instanceof InvalidCredentials) {
        res.setHeader('Authorization', '');
        res.setHeader('x-refresh-token', '');
      }

      handleErrors(err);
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Delete('revoke-token')
  async revokeToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      res.setHeader('Authorization', '');
      res.setHeader('x-refresh-token', '');

      return [
        await this.authService.revokeToken(req.user.jti),
        await this.authService.revokeToken(req.user.refreshJti),
      ];
    } catch (err: unknown) {
      handleErrors(err);
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.authService.findAll()
    } catch(err) {
      handleErrors(err)
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Delete()
  async delete(
    @Req() req: Request,
  ) {
    try {
      return await this.authService.remove(req.user.sub)
    } catch(err) {
      handleErrors(err)
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  async myProfile(@Req() req: Request) {
    return await this.authService.myProfile(req.user.sub)
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Patch('password')
  async updatePassword(@Req() req: Request, @Body() body: UpdatePasswordDto) {
    try {
      return await this.authService.updatePassword(
        req.user.id,
        body.oldPassword,
        body.newPassword,
      );
    } catch (err: unknown) {
      handleErrors(err);
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Patch('email')
  async updateEmail(@Req() req: Request, @Body() body: UpdateEmailDto) {
    try {
      return await this.authService.updateEmail(req.user.id, body.newEmail);
    } catch (err: unknown) {
      handleErrors(err);
    }
  }

  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Patch('username')
  async updateUsername(@Req() req: Request, @Body() body: UpdateUsernameDto) {
    try {
      return await this.authService.updateUsername(
        req.user.id,
        body.newUsername,
      );
    } catch (err: unknown) {
      handleErrors(err);
    }
  }
}
