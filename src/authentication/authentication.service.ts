import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RevokedToken, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { InvalidCredentials } from 'src/errors/InvalidCredentials';
import { v4 as uuid } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

import { InvalidTokenType } from '../errors/InvalidTokenType';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './contracts/JwtPayload.interface';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtType } from './enums/JwtType.enum';
import { SignInOAuthDto } from './dto/sign-in-oauth.dto';
import { InvalidSignInMethod } from 'src/errors/InvalidSignInMethod';
import { handleErrors } from 'src/utils/handle-errors';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  clientId: string = '863131281139-gcn6rjpl47hbf7s5asqmq2q31dmtn9m4.apps.googleusercontent.com';

  async generateTokens(user: User) {
    const refreshJti = uuid();

    const tokens = {
      accessToken: await this.jwtService.signAsync(
        {
          type: JwtType.ACCESS,
          refreshJti,
          sub: user.id,
        },
        {
          jwtid: uuid(),
          expiresIn: '2h',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        {
          type: JwtType.REFRESH,
          expiresIn: '20d',
          sub: user.id,
        },
        {
          jwtid: refreshJti,
        },
      ),
    };

    return tokens;
  }

  async signUp(newUser: SignUpDto) {
    newUser.password = await bcrypt.hash(newUser.password, 10);

    const user = await this.prisma.user.create({ data: newUser });

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async signIn(credentials: SignInDto) {
    const { email, password } = credentials;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email,
      }
    });

    if (!(await bcrypt.compare(password, user.password))) {
      throw new InvalidCredentials();
    }

    if (user.googleId != null) {
      throw new InvalidSignInMethod();
    }

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async signInAuth(body: SignInOAuthDto) {
    const { token } = body
    const client = new OAuth2Client(this.clientId);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: this.clientId, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const { email, sub: googleId, name } = payload;

    // Check if user exists by Google ID
    let user = await this.prisma.user.findUnique({
      where: { googleId }
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email }
      });
    }
    
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email,
          username: name,
          password: "",
          googleId: googleId
        }
      });
    }
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string) {
    const { sub, type, jti } = (await this.jwtService.decode(
      refreshToken,
    )) as JwtPayload;

    if (await this.prisma.revokedToken.findFirst({ where: { jti } }))
      throw new InvalidCredentials();

    if (type !== JwtType.REFRESH) throw new InvalidTokenType();

    await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    return await this.jwtService.signAsync(
      { type, refreshJti: jti },
      {
        jwtid: uuid(),
        subject: sub.toString(),
        expiresIn: '2h',
      },
    );
  }

  async revokeToken(jti: string): Promise<RevokedToken> {
    return await this.prisma.revokedToken.create({
      data: { jti },
    });
  }

  async myProfile(id: number) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        posts: true,
        comments: true,
        likes: true,
        favorite: true
      }
    })
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new InvalidCredentials();
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateEmail(userId: number, newEmail: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  }

  async updateUsername(userId: number, newUsername: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });
  }

  async remove(id: number) {
    const tmp = await this.prisma.comments.findMany({
      where: {authorId: id},
      include: {
        post: true
      }
    })

    const posts = await this.prisma.posts.findMany({
      where: {authorId: id}
    })

    posts.forEach(async (post) => {
        await this.prisma.posts.update({
          where: {id: post.id},
          data: {
            likeCounter: {decrement: 1},
            likes: {disconnect: { id: post.id }},
            favorite: {disconnect: {id: post.id}}
          }
        })
    });

    try {
      tmp.forEach(async (com) => {
        await this.prisma.posts.update({
          where: {id: com.post.id},
          data: {
              commentCounter: { decrement: 1 }
          }
        })
      });

      this.prisma.comments.deleteMany({
        where: { authorId: id }
      })
    } catch (err) {
      handleErrors(err)
    }

    await this.prisma.posts.deleteMany({
      where: {authorId : id}
    })

    return await this.prisma.user.delete({
      where: { id}
    })
  }

  async findAll() {
    return await this.prisma.user.findMany({
      include: {
        posts: true,
        comments: true,
        likes: true,
        favorite: true,
      }
    })
  }
}
