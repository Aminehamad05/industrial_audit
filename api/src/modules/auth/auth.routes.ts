import { Router } from "express";
import { login, register } from "./auth.service";
import { loginRequestSchema, registerRequestSchema } from "../../shared/types/auth";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AppError } from "../../shared/errors/AppError";
import { success } from "zod";
import fa from "zod/v4/locales/fa.cjs";

export const authRouter = Router();

authRouter.post("/register", requireAuth, requireRole(["Administrator"]), async (req, res) => {
  const parsed = registerRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
  }

  try {
    const result = await register(
      parsed.data.username,
      parsed.data.password,
      parsed.data.fullName,
      parsed.data.role
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
    const result = await login(parsed.data.username, parsed.data.password);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("Unexpected error during login:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


authRouter.post("/logMe", async (req, res) => {
  try{
    const data = req.body;
    if (data.username==='admin' && data.password === 'Welcome') {
      res.status(201).json({success:true, data:{user:'Super star', name:'Salah Tounsi'}})
    } else res.status(401).json({success:false, msg:'not a user , barra rawe7'})
  }catch (err){
    console.log("Error API Logme", err)
    res.status(500).json({success:false, msg:err})
  }
  
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});