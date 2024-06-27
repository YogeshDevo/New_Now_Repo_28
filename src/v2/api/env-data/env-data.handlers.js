"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOne = exports.updateOne = exports.deleteAll = exports.findOne = exports.findAll = exports.createOne = void 0;
const prisma_1 = require("../../../../prisma");
const createOne = async (req, res) => {
    try {
        const envData = await prisma_1.prisma.envData.create({
            data: req.body,
        });
        res.status(201).json(envData);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createOne = createOne;
const findAll = async (req, res) => {
    try {
        const envData = await prisma_1.prisma.envData.findMany();
        res.status(200).json(envData);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.findAll = findAll;
const findOne = async (req, res) => {
    try {
        const envData = await prisma_1.prisma.envData.findUnique({
            where: { id: String(req.params.id) },
        });
        if (envData) {
            res.status(200).json(envData);
        }
        else {
            res.status(404).json({ error: 'EnvData not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.findOne = findOne;
const deleteAll = async (req, res) => {
    try {
        await prisma_1.prisma.envData.deleteMany({});
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteAll = deleteAll;
const updateOne = async (req, res) => {
    try {
        const envData = await prisma_1.prisma.envData.update({
            where: { id: String(req.params.id) },
            data: req.body,
        });
        res.status(200).json(envData);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateOne = updateOne;
const deleteOne = async (req, res) => {
    try {
        await prisma_1.prisma.envData.delete({
            where: { id: String(req.params.id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteOne = deleteOne;
//# sourceMappingURL=env-data.handlers.js.map