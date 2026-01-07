"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChatModule", {
    enumerable: true,
    get: function() {
        return ChatModule;
    }
});
const _common = require("@nestjs/common");
const _chatservice = require("./chat.service");
const _chatcontroller = require("./chat.controller");
const _chatstreamcontroller = require("./chat-stream.controller");
const _aimodule = require("../ai/ai.module");
const _moderationmodule = require("../moderation/moderation.module");
const _analyticsmodule = require("../analytics/analytics.module");
const _metermodule = require("../meter/meter.module");
const _prismamodule = require("../prisma/prisma.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ChatModule = class ChatModule {
};
ChatModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _aimodule.AIModule,
            _moderationmodule.ModerationModule,
            _analyticsmodule.AnalyticsModule,
            _metermodule.MeterModule,
            _prismamodule.PrismaModule
        ],
        controllers: [
            _chatcontroller.ChatController,
            _chatstreamcontroller.ChatStreamController
        ],
        providers: [
            _chatservice.ChatService
        ],
        exports: [
            _chatservice.ChatService
        ]
    })
], ChatModule);
