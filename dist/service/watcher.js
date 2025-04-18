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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pingService_1 = require("./pingService");
const publisher_1 = require("../pubsub/publisher");
const node_cron_1 = __importDefault(require("node-cron"));
const prisma = new client_1.PrismaClient();
const runWatcher = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = new Date();
    const monitors = yield prisma.monitor.findMany();
    for (const monitor of monitors) {
        try {
            const lastPinged = (_a = monitor.lastPingedAt) !== null && _a !== void 0 ? _a : new Date(0);
            const nextPingtime = new Date(lastPinged.getTime() + monitor.interval * 1000);
            if (now < nextPingtime)
                continue;
            const { isUp, statusCode, } = yield (0, pingService_1.pingUrl)(monitor.url);
            const lastResult = yield prisma.pingResult.findFirst({
                where: { monitorId: monitor.id },
                orderBy: { timestamp: 'desc' }
            });
            console.log(lastResult);
            yield prisma.pingResult.create({
                data: {
                    monitorId: monitor.id,
                    isUp,
                    statusCode: statusCode !== null && statusCode !== void 0 ? statusCode : 0
                }
            });
            yield prisma.monitor.update({
                where: { id: monitor.id },
                data: { lastPingedAt: now },
            });
            if (lastResult && lastResult.isUp !== isUp) {
                yield (0, publisher_1.publishStatusChange)(monitor.id, isUp ? 'UP' : 'DOWN');
                console.log(`🔁 Status changed for ${monitor.url}: ${isUp ? 'UP' : 'DOWN'}`);
            }
        }
        catch (e) {
            console.log('some error occured', e);
        }
    }
});
node_cron_1.default.schedule('*/15 * * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('⏱ Running watcher...');
    yield runWatcher();
}));
