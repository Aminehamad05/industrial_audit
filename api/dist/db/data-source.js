"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("../config/env");
const user_entity_1 = require("../modules/auth/user.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mssql",
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    username: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    database: env_1.env.DB_NAME,
    synchronize: true,
    logging: env_1.env.NODE_ENV === "development",
    entities: [user_entity_1.User],
    migrations: ["src/db/migrations/*.ts"],
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
});
