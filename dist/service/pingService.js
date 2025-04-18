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
exports.pingUrl = void 0;
// src/services/pingService.ts
const axios_1 = __importDefault(require("axios"));
const pingUrl = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield axios_1.default.get(url, { timeout: 5000 });
        console.log(`${url} and the status is ${res.status}`);
        return {
            isUp: res.status >= 200 && res.status < 400,
            statusCode: res.status,
        };
    }
    catch (_a) {
        return {
            isUp: false,
        };
    }
});
exports.pingUrl = pingUrl;
