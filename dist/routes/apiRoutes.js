"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const auth_1 = require("../middleware/auth");
const monitorController_1 = __importDefault(require("../controllers/monitorController"));
const router = (0, express_1.Router)();
router.get('/users/:id', auth_1.authenticate, userController_1.default.getUser);
router.post('/register', userController_1.default.registerUser);
router.post('/user/login', userController_1.default.login);
router.post('/monitors', auth_1.authenticate, monitorController_1.default.createMonitor);
router.get('/monitor', auth_1.authenticate, monitorController_1.default.getAllMonitors);
router.get('/monitors/:id', auth_1.authenticate, monitorController_1.default.getMonitorById);
exports.default = router;
