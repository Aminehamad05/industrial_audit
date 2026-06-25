import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/users/user.routes";
import auditRoutes from "./modules/audits/audits.routes";
import plantRoutes from "./modules/plants/plant.routes";
import {requireAuth} from "./middleware/auth.middleware"
export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);

app.use("/admin",adminRouter)
app.use("/audits", auditRoutes);
app.use("/plants", plantRoutes);
