import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { User } from "../modules/users/user.entity";
import { Plant } from "../modules/plants/enitites/plant.entities";
import { Audit } from "../modules/audits/entitites/Audit";
import { AuditDetail } from "../modules/audits/entitites/AuditDetail";
import { Action } from "../modules/audits/entitites/Action";
import { ActionStatus } from "../modules/audits/entitites/ActionStatus";
import { Schedule } from "../modules/audits/entitites/Schedule";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: true,
  logging: env.NODE_ENV === "development",
  entities: [User, Plant, Audit, AuditDetail, Action, ActionStatus, Schedule],
  migrations: ["src/db/migrations/*.ts"],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});