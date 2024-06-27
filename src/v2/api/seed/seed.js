"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedBlock = exports.seedUser = exports.seed = void 0;
const prisma_1 = require("../../../../prisma");
// import { Tolerance } from '../api/tolerance/tolerance.model';
// import { Unit } from '../api/units/units.model';
const seedUnits = [
    'kg/cm²',
    'Pa',
    '°C',
    'Bar',
    'pH',
    '%RH',
    'µs/cm',
    'LPH',
    'sec',
    'hrs',
];
const seedTolerances = [
    {
        label: "HY",
        criticality: "C",
        tolerance: 20,
        frequency_year: 0,
        frequency_month: 6,
        frequency_day: 0,
    },
    {
        label: "Y",
        criticality: "NC",
        tolerance: 30,
        frequency_year: 1,
        frequency_month: 0,
        frequency_day: 0,
    },
    {
        label: "2Y",
        criticality: "I",
        tolerance: 30,
        frequency_year: 2,
        frequency_month: 0,
        frequency_day: 0,
    },
];
const seedBlocks = [
    {
        'properties': 'std-ins',
        'name': 'std-ins',
        'type': 0,
        'description': 'std-ins',
    },
    {
        'properties': 'cal-inst',
        'name': 'cal-inst',
        'type': 1,
        'description': 'cal-inst',
    },
    {
        'properties': 'std-ins',
        'name': 'gil std-ins',
        'type': 0,
        'description': 'std-ins',
    },
    {
        'properties': 'cal-inst',
        'name': 'gil cal-inst',
        'type': 1,
        'description': 'cal-inst',
    },
];
async function seed(req, res, next) {
    try {
        await prisma_1.prisma.unit.deleteMany({});
        const seedUnitsObjects = seedUnits.map((unitItem) => {
            return {
                unit: unitItem,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
            };
        });
        await prisma_1.prisma.unit.createMany({
            data: seedUnitsObjects,
        });
        const seedTolerancesObjects = seedTolerances.map((toleranceItem) => {
            return {
                tolerance: toleranceItem.tolerance,
                label: toleranceItem.label,
                frequency_year: toleranceItem.frequency_year,
                frequency_month: toleranceItem.frequency_month,
                frequency_day: toleranceItem.frequency_day,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                criticality: toleranceItem.criticality
            };
        });
        await prisma_1.prisma.tolerance.deleteMany({});
        await prisma_1.prisma.tolerance.createMany({
            data: seedTolerancesObjects,
        });
        res.status(201).json({ message: "Seeding Successful" });
    }
    catch (error) {
        next(error);
    }
}
exports.seed = seed;
async function seedUser(req, res, next) {
    try {
        await prisma_1.prisma.user.deleteMany({});
        await prisma_1.prisma.user.createMany({
            data: [
                {
                    email: 'admin@arizonsystems.com',
                    role: 'admin',
                    username: 'admin',
                    fname: 'Admin',
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: 'user@arizonsystems.com',
                    role: 'user',
                    username: 'user',
                    fname: 'User',
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: 'planner@arizonsystems.com',
                    role: 'planner',
                    username: 'planner',
                    fname: 'Planner',
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: 'approver@arizonsystems.com',
                    role: 'approver',
                    username: 'approver',
                    fname: 'Approver',
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: 'performer@arizonsystems.com',
                    role: 'performer',
                    username: 'performer',
                    fname: 'Performer',
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
            ],
        });
        res.status(201).json({ message: "Seeding Users Successful" });
    }
    catch (error) {
        next(error);
    }
}
exports.seedUser = seedUser;
async function seedBlock(req, res, next) {
    try {
        await prisma_1.prisma.instrumentDepartment.deleteMany({});
        await prisma_1.prisma.instrumentDepartment.createMany({
            data: seedBlocks,
        });
        res.status(201).json({ message: "Seeding Block Successful" });
    }
    catch (error) {
        next(error);
    }
}
exports.seedBlock = seedBlock;
// export async function seedSQL() {
//   await prisma.unit.deleteMany({});
//   const seedUnitsObjects = seedUnits.map((unitItem) => {
//     return {
//       unit: unitItem,
//       created_at: new Date().getTime(),
//       updated_at: new Date().getTime(),
//     };
//   });
//   await prisma.unit.createMany({
//     data: seedUnitsObjects,
//   });
//   const seedTolerancesObjects = seedTolerances.map((toleranceItem) => {
//     return {
//       tolerance: toleranceItem.tolerance,
//       label: toleranceItem.label,
//       frequency_year: toleranceItem.frequency_year,
//       frequency_month: toleranceItem.frequency_month,
//       frequency_day: toleranceItem.frequency_day,
//       created_at: new Date().getTime(),
//       updated_at: new Date().getTime(),
//     };
//   });
//   await prisma.tolerance.deleteMany({});
//   await prisma.tolerance.createMany({
//     data: seedTolerancesObjects,
//   });
//   if (process.env.SEED_BLOCK === 'Y') {
//     await prisma.instrumentDepartment.deleteMany({});
//     await prisma.instrumentDepartment.createMany({
//       data: seedBlocks,
//     });
//   }
//   if (process.env.SEED_USER === 'Y') {
//     await prisma.user.deleteMany({});
//     await prisma.user.createMany({
//       data: [
//         {
//           email: 'admin@arizonsystems.com',
//           role: 'admin',
//           username: 'admin',
//           fname: 'Admin',
//           created_at: new Date().getTime(),
//           updated_at: new Date().getTime(),
//         },
//         {
//           email: 'user@arizonsystems.com',
//           role: 'user',
//           username: 'user',
//           fname: 'User',
//           created_at: new Date().getTime(),
//           updated_at: new Date().getTime(),
//         },
//         {
//           email: 'planner@arizonsystems.com',
//           role: 'planner',
//           username: 'planner',
//           fname: 'Planner',
//           created_at: new Date().getTime(),
//           updated_at: new Date().getTime(),
//         },
//         {
//           email: 'approver@arizonsystems.com',
//           role: 'approver',
//           username: 'approver',
//           fname: 'Approver',
//           created_at: new Date().getTime(),
//           updated_at: new Date().getTime(),
//         },
//         {
//           email: 'performer@arizonsystems.com',
//           role: 'performer',
//           username: 'performer',
//           fname: 'Performer',
//           created_at: new Date().getTime(),
//           updated_at: new Date().getTime(),
//         },
//       ],
//     });
//   }
// }
//# sourceMappingURL=seed.js.map