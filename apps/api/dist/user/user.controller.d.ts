import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    requestDeletion(req: any): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    confirmDeletion(token: string): Promise<{
        message: string;
    }>;
    cancelDeletion(req: any): Promise<{
        message: string;
    }>;
    exportData(req: any): Promise<any>;
    getProfile(req: any): Promise<{
        userId: any;
    }>;
}
