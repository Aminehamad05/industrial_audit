import "reflect-metadata";
import { app } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./db/data-source";

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to MSSQL");
    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });