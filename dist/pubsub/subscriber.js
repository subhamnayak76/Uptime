"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribetoEmailEvents = void 0;
const redis_1 = require("redis");
const client_1 = require("@prisma/client");
const emailService_1 = require("../service/emailService");
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield redis.connect();
}))();
const subscribetoEmailEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    yield redis.subscribe('monitor-status', (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { monitorId, status } = JSON.parse(message);
            if (status !== 'DOWN')
                return;
            const monitor = yield prisma.monitor.findUnique({
                where: { id: monitorId },
                include: { user: true }
            });
            if (!monitor || !monitor.user)
                return;
            yield (0, emailService_1.sendDownAlert)(monitor.user.email, monitor.url);
            console.log(`alert sent to ${monitor.user.email} for ${monitor.url}`);
        }
        catch (e) {
            console.log('error in subcribere', e);
        }
    }));
    console.log('Redis subscriber is listening on monitor status');
});
exports.subscribetoEmailEvents = subscribetoEmailEvents;
