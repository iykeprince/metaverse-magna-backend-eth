"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_KEY = exports.DATABASE_NAME = exports.DATABASE_PASSWORD = exports.DATABASE_USER = exports.PORT = exports.JWT_DURATION = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_DURATION = process.env.JWT_DURATION;
exports.PORT = process.env.PORT || 8000;
exports.DATABASE_USER = process.env.DATABASE_USER;
exports.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
exports.DATABASE_NAME = process.env.DATABASE_NAME;
exports.API_KEY = process.env.API_KEY;
