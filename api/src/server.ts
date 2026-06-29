import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./db/prisma";

prisma.$connect()
  .then(() => {
    console.log("Connected to MSSQL via Prisma");
    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
