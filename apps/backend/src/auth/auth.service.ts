import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { backendDtos } from '@repo/shared';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@repo/db/src/generated/prisma/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthServices {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private async generateToken(user: Partial<User>) {
    const payload = { sub: user.id, role: user.role, isActive: user.isActive };

    await this.prisma.token.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '7m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.token.create({
      data: {
        userId: String(user.id),
        token: hashedRefreshToken,
        type: 'REFRESH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        // expiresAt:new Date(Date.now()+1 * 60 * 1000)
      },
    });

    return { accessToken, refreshToken };
  }

  async register(data: backendDtos.CreateUserDto) {
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
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashPassword,
        // role: data.role,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    const token = (100000 + Math.floor(Math.random() * 900000)).toString();
    const hashedToken = await bcrypt.hash(token, 10);
    await this.prisma.token.create({
      data: {
        token: hashedToken,
        userId: String(user.id),
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      },
    });
    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      token,
      user.id,
    );
    return userWithoutPassword;
  }

  async login(data: backendDtos.LoginDto, res) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!existingUser) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!existingUser.isVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { accessToken, refreshToken } =
      await this.generateToken(existingUser);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 60 * 1000, // Set to exactly 15 minutes in milliseconds
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    await this.prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
    // Remove password from response
    const { password, ...userWithoutPassword } = existingUser;
    Logger.log('accessToken', accessToken);
    Logger.log('refreshToken', refreshToken);
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async verifyEmail(data: backendDtos.VerifyUserDto) {
    const { token: otp, userId } = data;
    const token = await this.prisma.token.findFirst({
      where: {
        userId,
        type: 'EMAIL_VERIFICATION',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (token.expiresAt < new Date()) {
      await this.prisma.token.delete({
        where: { id: token.id },
      });

      throw new UnauthorizedException('Verification token expired');
    }

    const isMatch = await bcrypt.compare(otp, token.token);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await this.prisma.token.delete({
      where: { id: token.id },
    });

    return null;
  }

  async verifyEmailByQuery(otp: string, userId: string) {
    const token = await this.prisma.token.findFirst({
      where: {
        userId,
        type: 'EMAIL_VERIFICATION',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (token.expiresAt < new Date()) {
      await this.prisma.token.delete({
        where: { id: token.id },
      });

      throw new UnauthorizedException('Verification token expired');
    }

    const isMatch = await bcrypt.compare(otp, token.token);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await this.prisma.token.delete({
      where: { id: token.id },
    });

    return null;
  }
  async logout(req, res) {
    const refreshToken = req.refreshToken;
    const userId = req.user.id;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokens = await this.prisma.token.findMany({
      where: {
        type: 'REFRESH',
        userId,
      },
    });

    let matchedTokenId: string | null = null;

    for (const t of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, t.token);
      if (isMatch) {
        matchedTokenId = t.id;
        break;
      }
    }

    if (!matchedTokenId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // ✅ delete ONLY the matched refresh token
    await this.prisma.token.delete({
      where: { id: matchedTokenId },
    });

    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  async refreshToken(req, res) {
    if (!req.refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const tokens = await this.prisma.token.findMany({
      where: {
        type: 'REFRESH',
        userId: req.user.id,
      },
    });
    let matchedTokenId: string | null = null;
    for (const t of tokens) {
      const isMatch = await bcrypt.compare(req.refreshToken, t.token);
      if (isMatch) {
        matchedTokenId = t.id;
        break;
      }
    }
    if (!matchedTokenId) {
      throw new UnauthorizedException('Invalid token');
    }
    await this.prisma.token.delete({
      where: { id: matchedTokenId },
    });
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    if (!existingUser) {
      throw new UnauthorizedException('Unathorized user');
    }
    const { accessToken, refreshToken } =
      await this.generateToken(existingUser);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // Set to exactly 15 minutes in milliseconds
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    Logger.log('Refreshed token created again');
    return { accessToken, refreshToken, existingUser };
  }
}
