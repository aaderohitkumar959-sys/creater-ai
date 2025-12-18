"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const creator_module_1 = require("./creator/creator.module");
const payment_module_1 = require("./payment/payment.module");
const coin_module_1 = require("./coin/coin.module");
const llm_module_1 = require("./llm/llm.module");
const chat_module_1 = require("./chat/chat.module");
const moderation_module_1 = require("./moderation/moderation.module");
const admin_module_1 = require("./admin/admin.module");
const analytics_module_1 = require("./analytics/analytics.module");
const persona_module_1 = require("./persona/persona.module");
const meter_module_1 = require("./meter/meter.module");
const notification_module_1 = require("./notification/notification.module");
const quest_module_1 = require("./quest/quest.module");
const gamification_module_1 = require("./gamification/gamification.module");
const subscription_module_1 = require("./subscription/subscription.module");
const user_module_1 = require("./user/user.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            creator_module_1.CreatorModule,
            payment_module_1.PaymentModule,
            coin_module_1.CoinModule,
            llm_module_1.LLMModule,
            chat_module_1.ChatModule,
            moderation_module_1.ModerationModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
            persona_module_1.PersonaModule,
            meter_module_1.MeterModule,
            notification_module_1.NotificationModule,
            quest_module_1.QuestModule,
            gamification_module_1.GamificationModule,
            subscription_module_1.SubscriptionModule,
            user_module_1.UserModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map