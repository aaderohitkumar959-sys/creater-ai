import { CreatorService } from './creator.service';
export declare class CreatorController {
    private readonly creatorService;
    constructor(creatorService: CreatorService);
    createProfile(req: any, body: {
        bio: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        earnings: number;
        userId: string;
    }>;
    createPersona(req: any, body: {
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
    addTrainingData(body: {
        personaId: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.TrainingType;
        content: string;
        personaId: string;
    }>;
    getDashboard(req: any): Promise<{
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
