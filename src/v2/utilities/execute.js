"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../../prisma");
const utils_1 = require("../utils");
const seedSetPoints = async () => {
    const data = [
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        },
        {
            "reading": 10,
            "eq_reading": null,
            "before_for_adjustment": null,
            "before": 10,
            "eq_after": null,
            "after": null,
            "reading_string": "5.0",
            "eq_reading_string": null,
            "before_for_adjustment_string": null,
            "before_string": "5.00",
            "eq_after_string": null,
            "after_string": null
        }
    ];
    await prisma_1.prisma.$transaction(async (tx) => {
        const result = await tx.set_Point_calR.createMany({
            data: data,
        });
        return result;
    });
};
const getReportsData = async () => {
    await prisma_1.prisma.calReport.findMany({
        include: {
            set_points: true,
            standard_details: true,
            approved_by: true,
            performed_by: true,
            set_points_table: {
                include: {
                    set_points: true,
                },
            },
        }
    });
};
const getCalibrationData = async () => {
    await prisma_1.prisma.instrumentCalibration.findMany({
        include: {
            std_used: true,
        },
        where: {
            id: 'clxspm82g001qiouk25c5dk9n'
        }
    });
};
const deleteCalibrationData = async () => {
    await prisma_1.prisma.instrumentCalibration.deleteMany();
};
const getInsMasterData = async () => {
    await prisma_1.prisma.instrumentMaster.findMany();
};
async function execute() {
    await (0, utils_1.delay)(3500);
    // await seedSetPoints();
    // await getReportsData();
    // await getCalibrationData();
    // await getInsMasterData();
    // await deleteCalibrationData();
}
exports.default = execute;
//# sourceMappingURL=execute.js.map