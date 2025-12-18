export declare class AppController {
    getHello(): string;
    health(): {
        status: string;
        uptime: number;
        timestamp: string;
    };
    healthDeep(): Promise<{
        status: string;
        checks: {
            server: {
                status: string;
                uptime: number;
            };
            timestamp: string;
        };
    }>;
}
