"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validAuthToken = (token, secret) => {
    try {
        var decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (err) {
        return false;
    }
};
exports.validAuthToken = validAuthToken;
