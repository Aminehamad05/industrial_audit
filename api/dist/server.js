"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./db/prisma");
prisma_1.prisma.$connect()
    .then(() => {
    console.log("Connected to MSSQL via Prisma");
    app_1.app.listen(env_1.env.PORT, () => {
        console.log(`Server running on http://localhost:${env_1.env.PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
