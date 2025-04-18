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
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const createMonitor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url, interval, notificationEmail } = req.body;
        const userId = req.userId;
        const monitor = yield prisma.monitor.create({
            data: {
                url,
                interval,
                notificationEmail,
                userId,
            }
        });
        res.status(200).json(monitor);
    }
    catch (error) {
        console.log("error occured in the monitor ", error);
        res.status(500).json({ message: "internal server error" });
    }
});
const getAllMonitors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const monitors = yield prisma.monitor.findMany({
            include: { pingResults: true }
        });
        res.status(200).json(monitors);
    }
    catch (error) {
        console.log("error fetching monitors", error);
        res.status(500).json({ message: "internal server error" });
    }
});
const getMonitorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const monitor = yield prisma.monitor.findUnique({
            where: {
                id
            }
        });
        if (!monitor) {
            res.status(404).json({ message: 'user not found' });
            return;
        }
        res.status(200).json(monitor);
    }
    catch (error) {
        console.log('error fetching monitor', error);
        res.status(500).json({ message: 'internal server error' });
    }
});
exports.default = { createMonitor, getAllMonitors, getMonitorById };
