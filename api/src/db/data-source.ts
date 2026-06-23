import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { User } from "../modules/auth/user.entity";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: true,
  logging: env.NODE_ENV === "development",
  entities: [User],
  migrations: ["src/db/migrations/*.ts"],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});