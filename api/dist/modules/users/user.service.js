"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.deleteUser = deleteUser;
const prisma_1 = require("../../db/prisma");
const appError_1 = require("../../shared/errors/appError");
async function listUsers() {
    return prisma_1.prisma.aspnet_Users.findMany({
        select: {
            UserId: true,
            UserName: true,
            Email: true,
            Name: true,
            LastActivityDate: true,
        },
    });
}
async function getUserById(userId) {
    return prisma_1.prisma.aspnet_Users.findUnique({ where: { UserId: userId } });
}
async function deleteUser(userId) {
    const user = await prisma_1.prisma.aspnet_Users.findUnique({ where: { UserId: userId } });
    if (!user) {
        throw new appError_1.AppError(404, 'User not found');
    }
    await prisma_1.prisma.aspnet_Users.delete({ where: { UserId: userId } });
}
