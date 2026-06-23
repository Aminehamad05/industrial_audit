"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const data_source_1 = require("../../db/data-source");
const user_entity_1 = require("./user.entity");
const auth_1 = require("../../shared/types/auth");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const appError_1 = require("../../shared/errors/appError");
exports.adminRouter = (0, express_1.Router)();
const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
// Every route here requires an authenticated Administrator.
exports.adminRouter.use(auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["Administrator"]));
/**
 * GET /admin/users?status=Pending
 * Lists users, optionally filtered by account status.
 * No status query param = list everyone.
 */
exports.adminRouter.get("/users", async (req, res) => {
    const statusFilter = req.query.status;
    if (statusFilter && !auth_1.ACCOUNT_STATUSES.includes(statusFilter)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${auth_1.ACCOUNT_STATUSES.join(", ")}` });
    }
    const users = await userRepo.find({
        where: statusFilter
            ? { accountStatus: statusFilter }
            : {},
        select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
            accountStatus: true,
            createdAt: true,
        },
        order: {
            createdAt: "DESC",
        },
    });
    res.status(200).json({ users });
});
/**
 * Shared transition handler - validates the target user exists and
 * applies a new status. The specific routes below just say which
 * "from" states are legal and what the "to" state is.
 */
async function transitionStatus(userId, allowedFromStatuses, toStatus) {
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
        throw new appError_1.AppError(404, "User not found");
    }
    if (!allowedFromStatuses.includes(user.accountStatus)) {
        throw new appError_1.AppError(409, `Cannot move user from '${user.accountStatus}' to '${toStatus}'`);
    }
    user.accountStatus = toStatus;
    await userRepo.save(user);
    return user;
}
exports.adminRouter.patch("/users/:id/approve", async (req, res) => {
    try {
        const user = await transitionStatus(req.params.id, ["Pending"], "Active");
        res.status(200).json({ user });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        throw err;
    }
});
exports.adminRouter.patch("/users/:id/reject", async (req, res) => {
    try {
        const user = await transitionStatus(req.params.id, ["Pending"], "Rejected");
        res.status(200).json({ user });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        throw err;
    }
});
exports.adminRouter.patch("/users/:id/block", async (req, res) => {
    try {
        const user = await transitionStatus(req.params.id, ["Active"], "Blocked");
        res.status(200).json({ user });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        throw err;
    }
});
exports.adminRouter.patch("/users/:id/unblock", async (req, res) => {
    try {
        const user = await transitionStatus(req.params.id, ["Blocked"], "Active");
        res.status(200).json({ user });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        throw err;
    }
});
exports.adminRouter.delete("/users/:id", async (req, res) => {
    try {
        const user = await userRepo.findOne({ where: { id: req.params.id } });
        if (!user) {
            throw new appError_1.AppError(404, "User not found");
        }
        await userRepo.remove(user);
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error("Unexpected error during delete:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
