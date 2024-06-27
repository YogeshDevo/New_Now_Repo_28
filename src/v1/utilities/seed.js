"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tolerance_model_1 = require("../api/tolerance/tolerance.model");
const units_model_1 = require("../api/units/units.model");
const inc_dep_model_1 = require("../api/instrument_department/inc-dep.model");
const mongodb_1 = require("mongodb");
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
        label: 'HY',
        tolerance: 20,
        frequency: 180,
    },
    {
        label: 'Y',
        tolerance: 30,
        frequency: 365,
    },
    {
        label: '2Y',
        tolerance: 30,
        frequency: 730,
    },
];
const seedBlocks = [
    {
        '_id': new mongodb_1.ObjectId('662b6cb4f5278178e6cef503'),
        'properties': 'std-ins',
        'name': 'std-ins',
        'type': 0,
        'description': 'std-ins',
    },
    {
        '_id': new mongodb_1.ObjectId('662c6840b804afdaf1101731'),
        'properties': 'cal-inst',
        'name': 'cal-inst',
        'type': 1,
        'description': 'cal-inst',
    },
    {
        '_id': new mongodb_1.ObjectId('6644737bc2e3da931fb329ff'),
        'properties': 'std-ins',
        'name': 'gil std-ins',
        'type': 0,
        'description': 'std-ins',
    },
    {
        '_id': new mongodb_1.ObjectId('66447394c2e3da931fb32a01'),
        'properties': 'cal-inst',
        'name': 'gil cal-inst',
        'type': 1,
        'description': 'cal-inst',
    },
];
async function seedMongo() {
    await units_model_1.Units.deleteMany({});
    const seedUnitsObjects = seedUnits.map((unitItem) => {
        return { unit: unitItem,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime() };
    });
    await units_model_1.Units.insertMany(seedUnitsObjects);
    const seedTolerancesObjects = seedTolerances.map((toleranceItem) => {
        return { tolerance: toleranceItem.tolerance,
            frequency: toleranceItem.frequency,
            label: toleranceItem.label,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime() };
    });
    await tolerance_model_1.Tolerances.deleteMany({});
    await tolerance_model_1.Tolerances.insertMany(seedTolerancesObjects);
    await inc_dep_model_1.InstrumentDepartments.deleteMany({});
    await inc_dep_model_1.InstrumentDepartments.insertMany(seedBlocks);
}
exports.default = seedMongo;
//# sourceMappingURL=seed.js.map