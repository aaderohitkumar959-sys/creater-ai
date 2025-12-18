import { QuestService } from './quest.service';
export declare class QuestController {
    private readonly questService;
    constructor(questService: QuestService);
    getDailyStatus(req: any): Promise<{
        streak: number;
        canClaim: boolean;
        rewardAmount: number;
    }>;
    claimDailyReward(req: any): Promise<{
        streak: number;
        reward: number;
        message: string;
    }>;
}
