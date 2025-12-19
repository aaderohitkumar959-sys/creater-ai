"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    console.log('[Bootstrap] Starting NestJS application...');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('[Bootstrap] NestJS application created.');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    'https://js.stripe.com',
                    'https://checkout.razorpay.com',
                ],
                frameSrc: [
                    "'self'",
                    'https://js.stripe.com',
                    'https://api.razorpay.com',
                ],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    }));
    const allowedOrigins = [
        'https://syelope-web.vercel.app',
        'https://creater-ai-web.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
    ];
    if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = process.env.PORT ?? 3001;
    console.log(`[Bootstrap] Attempting to listen on port ${port}...`);
    await app.listen(port, '0.0.0.0');
    console.log(`[Bootstrap] Application is running on: ${await app.getUrl()}`);
}
bootstrap();
