import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  async validateUser(payload: any): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (user) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Ensure user exists in database since we are using a dual-auth system
    // (NextAuth on frontend, JWT on backend)
    const dbUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name,
        image: user.image,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role || 'USER',
      },
    });

    const tokens = await this.getTokens(
      dbUser.id,
      dbUser.email || '',
      dbUser.role as any,
    );
    await this.updateRefreshToken(dbUser.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    // In a real app, we might invalidate the refresh token in the DB
    // For now, we rely on client-side removal, but let's clear it if we had a column
    return true;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ForbiddenException('Access Denied');

    // In a full implementation, we would compare refreshToken with a hashed version in DB.
    // Since we didn't add a column for it in the schema yet, we verify signature.

    const tokens = await this.getTokens(user.id, user.email || '', user.role as any);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    // TODO: Save hash to DB
  }

  async getTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret:
            this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  hashData(data: string) {
    return argon2.hash(data);
  }
}
