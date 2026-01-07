"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LocalLLMProvider", {
    enumerable: true,
    get: function() {
        return LocalLLMProvider;
    }
});
const _common = require("@nestjs/common");
const _baseprovider = require("./base.provider");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LocalLLMProvider = class LocalLLMProvider extends _baseprovider.BaseLLMProvider {
    async generateResponse(messages, options) {
        // TODO: Implement local model integration (e.g., via ollama, llama.cpp)
        // For now, return a stub response
        console.warn('Local LLM provider not yet implemented, returning stub response');
        return {
            content: 'This is a stub response from local model. Please configure OpenRouter or implement local model support.',
            tokensUsed: 0,
            model: 'local-stub',
            cost: 0
        };
    }
    constructor(){
        super();
    }
};
LocalLLMProvider = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], LocalLLMProvider);
