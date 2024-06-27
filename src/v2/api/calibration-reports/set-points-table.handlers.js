"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSetPoints = exports.createSetPoints = exports.updateSetPointsTable = exports.createSetPointsTable = void 0;
const prisma_1 = require("../../../../prisma");
const utils_1 = require("../../utils");
async function createSetPointsTable(req, res, next) {
    const dataWithSetPoints = req.body.data;
    const cfrData = req.body.cfrData;
    const { calReportId, set_points, ...SPT_DATA } = dataWithSetPoints;
    try {
        const transaction = await prisma_1.prisma.$transaction(async (tx) => {
            const result = await tx.set_Point_Table.create({
                data: {
                    ...SPT_DATA,
                    calReportId: calReportId,
                    set_points: {
                        createMany: {
                            data: set_points ?? [],
                        },
                    },
                },
            });
            await tx.cfr.create({
                data: cfrData,
            });
            return result;
        });
        const dataToSend = await (0, utils_1.convertIdTO_id)(transaction);
        res.status(201).json({
            data: dataToSend,
            message: "Table Section added successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createSetPointsTable = createSetPointsTable;
// Update set points table won't update their children tables ex: [set_points]
async function updateSetPointsTable(req, res, next) {
    const setPointsTableId = req.params.id;
    const data = req.body.data;
    const cfrData = req.body.cfrData;
    try {
        const transaction = await prisma_1.prisma.$transaction(async (tx) => {
            const result = await tx.set_Point_Table.update({
                where: {
                    id: setPointsTableId,
                },
                data: data,
            });
            await tx.cfr.create({
                data: cfrData,
            });
            return result;
        });
        const dataToSend = await (0, utils_1.convertIdTO_id)(transaction);
        res.status(200).json({
            data: dataToSend,
            message: "Channel Updated Successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.updateSetPointsTable = updateSetPointsTable;
async function createSetPoints(req, res, next) {
    const setPoint = req.body.data;
    // This setPoint includes the setPointTableId
    const cfrData = req.body.cfrData;
    try {
        const transaction = await prisma_1.prisma.$transaction(async (tx) => {
            const result = await tx.set_Point_calR.create({
                data: setPoint,
            });
            await tx.cfr.create({
                data: cfrData,
            });
            return result;
        });
        res.status(201).json({
            data: transaction,
            message: "Set Point added successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.createSetPoints = createSetPoints;
async function updateSetPoints(req, res, next) {
    const setPointId = req.params.id;
    const setPoint = req.body.data;
    const cfrData = req.body.cfrData;
    try {
        const transaction = await prisma_1.prisma.$transaction(async (tx) => {
            const result = await tx.set_Point_calR.update({
                where: {
                    id: setPointId,
                },
                data: setPoint,
            });
            await tx.cfr.create({
                data: cfrData,
            });
            return result;
        });
        res.status(200).json({
            data: transaction,
            message: "Set Point updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.updateSetPoints = updateSetPoints;
//# sourceMappingURL=set-points-table.handlers.js.map