"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ErrorMonitoringService", {
    enumerable: true,
    get: function() {
        return ErrorMonitoringService;
    }
});
const _common = require("@nestjs/common");
const _node = /*#__PURE__*/ _interop_require_wildcard(require("@sentry/node"));
const _config = require("@nestjs/config");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ErrorMonitoringService = class ErrorMonitoringService {
    onModuleInit() {
        const sentryDsn = this.config.get('SENTRY_DSN');
        if (!sentryDsn) {
            console.warn('[SENTRY] DSN not configured, error monitoring disabled');
            return;
        }
        _node.init({
            dsn: sentryDsn,
            environment: this.config.get('NODE_ENV') || 'development',
            tracesSampleRate: 0.1,
            beforeSend (event, hint) {
                // Filter out sensitive data
                if (event.request) {
                    delete event.request.cookies;
                    delete event.request.headers?.['authorization'];
                }
                return event;
            }
        });
        console.log('[SENTRY] Error monitoring initialized');
    }
    /**
     * Capture exception with context
     */ captureException(error, context) {
        if (context) {
            _node.setContext('additional_info', context);
        }
        _node.captureException(error);
    }
    /**
     * Capture message (for warnings, info)
     */ captureMessage(message, level = 'info') {
        _node.captureMessage(message, level);
    }
    /**
     * Set user context for error tracking
     */ setUser(userId, email) {
        _node.setUser({
            id: userId,
            email
        });
    }
    /**
     * Clear user context (on logout)
     */ clearUser() {
        _node.setUser(null);
    }
    /**
     * Add breadcrumb for debugging
     */ addBreadcrumb(message, category, data) {
        _node.addBreadcrumb({
            message,
            category,
            data,
            level: 'info'
        });
    }
    constructor(config){
        this.config = config;
    }
};
ErrorMonitoringService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], ErrorMonitoringService);
