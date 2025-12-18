import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        email: string | null;
        name: string | null;
        emailVerified: Date | null;
        image: string | null;
        role: import(".prisma/client").$Enums.Role;
        coins: number;
        dailyMessageCount: number;
        lastMessageDate: Date;
        loginStreak: number;
        lastLoginDate: Date;
        lastDailyRewardClaimed: Date | null;
        stripeCustomerId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isBanned: boolean;
        bannedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
