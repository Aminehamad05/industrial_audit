"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const auth_1 = require("../../shared/types/auth");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const appError_1 = require("../../shared/errors/appError");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", async (req, res) => {
    const parsed = auth_1.registerRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
    }
    try {
        const result = await (0, auth_service_1.register)(parsed.data.username, parsed.data.email, parsed.data.password, parsed.data.fullName, parsed.data.role, parsed.data.division);
        return res.status(201).json(result);
    }
    catch (err) {
        if (err instanceof appError_1.AppError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Unexpected error during register:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.authRouter.post("/login", async (req, res) => {
    const parsed = auth_1.loginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
    }
    try {
        const result = await (0, auth_service_1.login)(parsed.data.email, parsed.data.password);
        return res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof appError_1.AppError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Unexpected error during login:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.authRouter.post("/logMe", async (req, res) => {
    try {
        const data = req.body;
        if (data.username === 'admin' && data.password === 'Welcome') {
            res.status(201).json({ success: true, data: { user: 'Super star', name: 'Salah Tounsi' } });
        }
        else
            res.status(401).json({ success: false, msg: 'not a user , barra rawe7' });
    }
    catch (err) {
        console.log("Error API Logme", err);
        res.status(500).json({ success: false, msg: err });
    }
});
exports.authRouter.get("/me", auth_middleware_1.requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
});
