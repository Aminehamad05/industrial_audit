"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_1 = require("./app");
const env_1 = require("./config/env");
const data_source_1 = require("./db/data-source");
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Connected to MSSQL");
    app_1.app.listen(env_1.env.PORT, () => {
        console.log(`Server running on http://localhost:${env_1.env.PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
