"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const user_routes_1 = require("./modules/users/user.routes");
const audits_routes_1 = __importDefault(require("./modules/audits/audits.routes"));
const plant_routes_1 = __importDefault(require("./modules/plants/plant.routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
exports.app.use("/auth", auth_routes_1.authRouter);
exports.app.use("/admin", user_routes_1.adminRouter);
exports.app.use("/audits", audits_routes_1.default);
exports.app.use("/plants", plant_routes_1.default);
