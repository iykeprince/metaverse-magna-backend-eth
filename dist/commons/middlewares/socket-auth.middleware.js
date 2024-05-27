"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = void 0;
const config_1 = require("../../configs/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socketAuth = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error("Unauthorized"));
    jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET, (err, decoded) => {
        if (err)
            return next(new Error("Unauthorized"));
        socket.username = decoded.username;
        next();
    });
};
exports.socketAuth = socketAuth;
