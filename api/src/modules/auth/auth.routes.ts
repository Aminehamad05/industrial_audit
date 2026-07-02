import { Router } from "express";
import { login, register } from "./auth.service";
import { loginRequestSchema, registerRequestSchema } from "../../shared/types/auth";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AppError } from "../../shared/errors/appError";
import { listSupervisors } from "../users/user.service";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
  }

  try {
    const result = await register(
      parsed.data.username,
      parsed.data.email,
      parsed.data.password,
      parsed.data.fullName,
      parsed.data.role,
      parsed.data.plant,
      parsed.data.mentorName
    );
    return res.status(201).json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("Unexpected error during register:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
  }

  try {
    const result = await login(parsed.data.email, parsed.data.password);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("Unexpected error during login:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


 

authRouter.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

authRouter.get("/supervisors", async (req, res) => {
  try {
    const supervisors = await listSupervisors();
    res.status(200).json({
      supervisors: supervisors.map((s) => ({
        id: s.UserId,
        username: s.UserName,
        email: s.Email,
        fullName: s.Name,
      })),
    });
  } catch (err) {
    console.error("Unexpected error fetching supervisors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});