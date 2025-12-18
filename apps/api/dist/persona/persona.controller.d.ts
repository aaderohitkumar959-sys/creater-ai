import { PrismaService } from '../prisma/prisma.service';
export declare class PersonaController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPersonas(search?: string, category?: string): Promise<({
        creator: {
            user: {
                name: string | null;
                image: string | null;
            };
            id: string;
            bio: string | null;
        };
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
    })[]>;
    getFeaturedPersonas(): Promise<({
        creator: {
            id: string;
            bio: string | null;
        };
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
    })[]>;
    getPersona(id: string): Promise<({
        creator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bio: string | null;
            earnings: number;
            userId: string;
        };
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
    updatePersona(id: string, data: {
        name?: string;
        description?: string;
        defaultCoinCost?: number;
        isFeatured?: boolean;
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
}
