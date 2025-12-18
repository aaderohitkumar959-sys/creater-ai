import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class CreatorService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    private encrypt;
    createCreatorProfile(userId: string, bio: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        earnings: number;
        userId: string;
    }>;
    createPersona(creatorId: string, data: {
        name: string;
        description: string;
        avatarUrl?: string;
        personality: any;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
        description: string | null;
        category: string | null;
        isFeatured: boolean;
        defaultCoinCost: number;
        personality: import("@prisma/client/runtime/library").JsonValue | null;
        creatorId: string;
    }>;
    addTrainingData(personaId: string, content: string, type?: 'TEXT' | 'FILE'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.TrainingType;
        content: string;
        personaId: string;
    }>;
    getCreatorProfile(userId: string): Promise<({
        personas: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            description: string | null;
            category: string | null;
            isFeatured: boolean;
            defaultCoinCost: number;
            personality: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        earnings: number;
        userId: string;
    }) | null>;
    getPersonaById(personaId: string): Promise<({
        creator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bio: string | null;
            earnings: number;
            userId: string;
        };
        trainingData: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TrainingType;
            content: string;
            personaId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
        description: string | null;
        category: string | null;
        isFeatured: boolean;
        defaultCoinCost: number;
        personality: import("@prisma/client/runtime/library").JsonValue | null;
        creatorId: string;
    }) | null>;
    updatePersona(personaId: string, data: {
        name?: string;
        description?: string;
        avatarUrl?: string;
        personality?: any;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
        description: string | null;
        category: string | null;
        isFeatured: boolean;
        defaultCoinCost: number;
        personality: import("@prisma/client/runtime/library").JsonValue | null;
        creatorId: string;
    }>;
    getDashboardStats(userId: string): Promise<{
        earnings: number;
        personas: {
            conversationCount: number;
            _count: {
                conversations: number;
            };
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            description: string | null;
            category: string | null;
            isFeatured: boolean;
            defaultCoinCost: number;
            personality: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        }[];
        totalPersonas: number;
    } | null>;
}
