"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCurrentMetricsInJSON = exports.findCurrentMetrics = void 0;
const prisma_1 = require("../../../../prisma");
const findCurrentMetrics = async (req, res) => {
    res.set('Content-Type', 'text');
    const metrics = await prisma_1.prisma.$metrics.prometheus();
    res.status(200).end(metrics);
    res.status(200).end();
};
exports.findCurrentMetrics = findCurrentMetrics;
const findCurrentMetricsInJSON = async (req, res) => {
    const metrics = await prisma_1.prisma.$metrics.json();
    res.status(200).json(metrics);
    res.status(200).end();
};
exports.findCurrentMetricsInJSON = findCurrentMetricsInJSON;
//# sourceMappingURL=metrics.handler.js.map