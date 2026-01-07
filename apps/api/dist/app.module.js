"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _core = require("@nestjs/core");
const _config = require("@nestjs/config");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
const _authmodule = require("./auth/auth.module");
const _creatormodule = require("./creator/creator.module");
const _paymentmodule = require("./payment/payment.module");
const _coinmodule = require("./coin/coin.module");
const _llmmodule = require("./llm/llm.module");
const _chatmodule = require("./chat/chat.module");
const _moderationmodule = require("./moderation/moderation.module");
const _adminmodule = require("./admin/admin.module");
const _analyticsmodule = require("./analytics/analytics.module");
const _personamodule = require("./persona/persona.module");
const _metermodule = require("./meter/meter.module");
const _notificationmodule = require("./notification/notification.module");
const _questmodule = require("./quest/quest.module");
const _gamificationmodule = require("./gamification/gamification.module");
const _subscriptionmodule = require("./subscription/subscription.module");
const _usermodule = require("./user/user.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule.forRoot({
                isGlobal: true
            }),
            _throttler.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100
                }
            ]),
            _authmodule.AuthModule,
            _creatormodule.CreatorModule,
            _paymentmodule.PaymentModule,
            _coinmodule.CoinModule,
            _llmmodule.LLMModule,
            _chatmodule.ChatModule,
            _moderationmodule.ModerationModule,
            _adminmodule.AdminModule,
            _analyticsmodule.AnalyticsModule,
            _personamodule.PersonaModule,
            _metermodule.MeterModule,
            _notificationmodule.NotificationModule,
            _questmodule.QuestModule,
            _gamificationmodule.GamificationModule,
            _subscriptionmodule.SubscriptionModule,
            _usermodule.UserModule
        ],
        controllers: [
            _appcontroller.AppController
        ],
        providers: [
            _appservice.AppService,
            {
                provide: _core.APP_GUARD,
                useClass: _throttler.ThrottlerGuard
            }
        ]
    })
], AppModule);
