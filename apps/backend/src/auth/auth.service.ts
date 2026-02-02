import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type{ CreateUserDto ,LoginDto} from '@repo/shared';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@repo/db/src/generated/prisma/client';

@Injectable()
export class AuthServices {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateToken(user: Partial<User>) {
    const payload = { sub: user.id };

    // 1. Clean up ALL expired tokens to keep DB healthy
    await this.prisma.token.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    } as any);

    // 2. Store the token (Ideally, this should be a Refresh Token)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.token.create({
      data: {
        expiresAt,
        token: accessToken,
        userId: String(user.id),
      },
    });

    return accessToken;
  }

  async register(data: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashPassword,
      }
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: LoginDto, res) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!existingUser) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(
      data.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = await this.generateToken(existingUser);
    res.cookie('uid', token, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = existingUser;
    return { user: userWithoutPassword, token };
  }

  async logout(token: string, res) {
    // Delete only the specific token being used
    const deletedToken = await this.prisma.token.deleteMany({
      where: {
        token: token,
      },
    });

    if (deletedToken.count === 0) {
      throw new UnauthorizedException('Invalid token');
    }
    res.clearCookie('uid');
    return { message: 'Logged out successfully' };
  }
}
