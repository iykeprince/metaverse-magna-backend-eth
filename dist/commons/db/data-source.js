"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("../../entities/User");
const config_1 = require("../../configs/config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    username: config_1.DATABASE_USER,
    password: config_1.DATABASE_PASSWORD,
    database: config_1.DATABASE_NAME,
    synchronize: true,
    logging: false,
    entities: [User_1.User],
    migrations: ["./migrations/"],
    subscribers: [],
});
