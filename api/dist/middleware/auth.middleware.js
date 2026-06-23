"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const auth_service_1 = require("../modules/auth/auth.service");
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    console.log(req.headers);
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }
    const token = header.slice("Bearer ".length);
    try {
        req.user = (0, auth_service_1.verifyToken)(token);
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions for this action" });
        }
        next();
    };
}
