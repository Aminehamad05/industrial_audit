"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPlants = listPlants;
exports.getPlant = getPlant;
exports.createPlant = createPlant;
exports.updatePlant = updatePlant;
exports.deletePlant = deletePlant;
exports.getPlantAudits = getPlantAudits;
exports.getPlantUsers = getPlantUsers;
exports.getPlantSchedules = getPlantSchedules;
exports.getPlantDashboard = getPlantDashboard;
const plantService = __importStar(require("./plant.service"));
const appError_1 = require("../../shared/errors/appError");
async function listPlants(req, res) {
    try {
        const plants = await plantService.getAllPlants();
        res.status(200).json({ plants });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in listPlants:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getPlant(req, res) {
    try {
        const plantId = Number(req.params.id);
        const plant = await plantService.getPlantById(plantId);
        res.status(200).json({ plant });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in getPlant:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function createPlant(req, res) {
    try {
        const plant = await plantService.createPlant(req.body);
        res.status(201).json({ plant });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in createPlant:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updatePlant(req, res) {
    try {
        const plantId = Number(req.params.id);
        const plant = await plantService.updatePlant(plantId, req.body);
        res.status(200).json({ plant });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in updatePlant:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deletePlant(req, res) {
    try {
        const plantId = Number(req.params.id);
        await plantService.deletePlant(plantId);
        res.status(200).json({ message: 'Plant deleted successfully' });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in deletePlant:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getPlantAudits(req, res) {
    try {
        const plantId = Number(req.params.id);
        const audits = await plantService.getPlantAudits(plantId);
        res.status(200).json({ audits });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in getPlantAudits:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getPlantUsers(req, res) {
    try {
        const plantId = Number(req.params.id);
        const users = await plantService.getPlantUsers(plantId);
        res.status(200).json({ users });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in getPlantUsers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getPlantSchedules(req, res) {
    try {
        const plantId = Number(req.params.id);
        const schedules = await plantService.getPlantSchedules(plantId);
        res.status(200).json({ schedules });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in getPlantSchedules:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getPlantDashboard(req, res) {
    try {
        const plantId = Number(req.params.id);
        const dashboard = await plantService.getPlantDashboard(plantId);
        res.status(200).json({ dashboard });
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            return res.status(err.statusCode).json({ error: err.message });
        console.error('Unexpected error in getPlantDashboard:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
