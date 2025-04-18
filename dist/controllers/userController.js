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
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const salt_Round = 10;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        const existinguser = yield prisma.user.findUnique({
            where: {
                email
            }
        });
        if (existinguser) {
            return res.status(400).json({ message: 'user already exit' });
        }
        const hashedpass = yield bcrypt_1.default.hash(password, salt_Round);
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedpass,
                name,
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.log('error creating user ', error);
        res.status(500).json({ message: 'internal server error' });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.user.findUnique({
            where: {
                email
            }
        });
        console.log(user);
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ message: "invalid credentials" });
            return;
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        const updatedUser = yield prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    }
    catch (error) {
        console.log('error while login ');
        res.status(403).json({ message: 'token expired or invalid' });
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield prisma.user.findUnique({
            where: { id },
            include: { monitors: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        res.status(200).json({ data: user });
    }
    catch (error) {
        console.log('error fetching user:', error);
        res.status(500).json({ message: "internal server error" });
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ message: 'No refresh token' });
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const user = yield prisma.user.findUnique({ where: { id: payload.id } });
        if (!user || user.refreshToken !== token)
            return res.status(403).json({ message: 'Invalid refresh token' });
        const newAccessToken = (0, jwt_1.generateAccessToken)(user.id);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        yield prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        res.status(403).json({ message: 'Token expired or invalid' });
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.sendStatus(204);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        yield prisma.user.update({
            where: { id: payload.id },
            data: {
                refreshToken: null
            }
        });
        res.clearCookie('refreshToken');
        res.sendStatus(204);
    }
    catch (_a) {
        res.clearCookie('refreshToken');
        res.sendStatus(204);
    }
});
exports.default = {
    registerUser, getUser, login, refresh, logout
};
