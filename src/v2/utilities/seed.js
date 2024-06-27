"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../../prisma");
const seedUnits = [
    "kg/cm²",
    "Pa",
    "°C",
    "Bar",
    "pH",
    "%RH",
    "µs/cm",
    "LPH",
    "sec",
    "hrs",
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
        properties: "std-ins",
        name: "std-ins",
        type: 0,
        description: "std-ins",
    },
    {
        properties: "cal-inst",
        name: "cal-inst",
        type: 1,
        description: "cal-inst",
    },
    {
        properties: "std-ins",
        name: "gil std-ins",
        type: 0,
        description: "std-ins",
    },
    {
        properties: "cal-inst",
        name: "gil cal-inst",
        type: 1,
        description: "cal-inst",
    },
];
async function seedSQL() {
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
            criticality: toleranceItem.criticality,
            frequency_year: toleranceItem.frequency_year,
            frequency_month: toleranceItem.frequency_month,
            frequency_day: toleranceItem.frequency_day,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
        };
    });
    await prisma_1.prisma.tolerance.deleteMany({});
    await prisma_1.prisma.tolerance.createMany({
        data: seedTolerancesObjects,
    });
    if (process.env.SEED_BLOCK === "Y") {
        await prisma_1.prisma.instrumentDepartment.deleteMany({});
        await prisma_1.prisma.instrumentDepartment.createMany({
            data: seedBlocks,
        });
    }
    if (process.env.SEED_USER === "Y") {
        await prisma_1.prisma.user.deleteMany({});
        await prisma_1.prisma.user.createMany({
            data: [
                {
                    email: "admin@arizonsystems.com",
                    role: "admin",
                    username: "admin",
                    fname: "Admin",
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: "user@arizonsystems.com",
                    role: "user",
                    username: "user",
                    fname: "User",
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: "planner@arizonsystems.com",
                    role: "planner",
                    username: "planner",
                    fname: "Planner",
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: "approver@arizonsystems.com",
                    role: "approver",
                    username: "approver",
                    fname: "Approver",
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
                {
                    email: "performer@arizonsystems.com",
                    role: "performer",
                    username: "performer",
                    fname: "Performer",
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                },
            ],
        });
    }
}
exports.default = seedSQL;
//# sourceMappingURL=seed.js.map