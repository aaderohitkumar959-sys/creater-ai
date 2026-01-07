"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ModerationModule", {
    enumerable: true,
    get: function() {
        return ModerationModule;
    }
});
const _common = require("@nestjs/common");
const _moderationservice = require("./moderation.service");
const _moderationcontroller = require("./moderation.controller");
const _reportservice = require("./report.service");
const _reportcontroller = require("./report.controller");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ModerationModule = class ModerationModule {
};
ModerationModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule
        ],
        providers: [
            _moderationservice.ModerationService,
            _reportservice.ReportService
        ],
        controllers: [
            _moderationcontroller.ModerationController,
            _reportcontroller.ReportController
        ],
        exports: [
            _moderationservice.ModerationService,
            _reportservice.ReportService
        ]
    })
], ModerationModule);
