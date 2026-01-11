"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _appmodule = require("./app.module");
const _common = require("@nestjs/common");
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
const _failsafefilter = require("./common/filters/failsafe.filter");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function bootstrap() {
    console.log('[Bootstrap] Starting NestJS application...');
    console.log('DEPLOYMENT VERSION: HARD fail check (v2)'); // Tracer log
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    console.log('[Bootstrap] NestJS application created.');
    // 1. Enable Helmet with CSP
    app.use((0, _helmet.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [
                    "'self'"
                ],
                scriptSrc: [
                    "'self'",
                    'https://js.stripe.com',
                    'https://checkout.razorpay.com'
                ],
                frameSrc: [
                    "'self'",
                    'https://js.stripe.com',
                    'https://api.razorpay.com'
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'https:'
                ]
            }
        }
    }));
    // 2. Strict CORS - Allow production Vercel and localhost
    const allowedOrigins = [
        'https://createrai-web.vercel.app',
        'https://creater-ai-web.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
    ];
    if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }
    app.enableCors({
        origin: (origin, callback)=>{
            // Allow requests with no origin (mobile apps, Postman, etc)
            if (!origin) return callback(null, true);
            // Check explicit allow list
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Check Vercel deployments (preview/production)
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    });
    // Add logging middleware
    app.use((req, res, next)=>{
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        transform: true
    }));
    // SMART FAILSAFE: ACTIVE (Production Mode)
    app.useGlobalFilters(new _failsafefilter.FailsafeFilter());
    const port = process.env.PORT ?? 3001;
    console.log(`[Bootstrap] Attempting to listen on port ${port}...`);
    await app.listen(port, '0.0.0.0');
    console.log(`[Bootstrap] Application is running on: ${await app.getUrl()}`);
}
bootstrap();
