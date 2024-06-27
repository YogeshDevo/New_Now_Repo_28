"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOneRN = exports.bulkApproveReport = exports.bulkReturnReport = exports.returnReport = exports.deleteReport = exports.approveReport = exports.sendForApproval = exports.createReport = void 0;
const index_1 = require("../../../../prisma/index");
// import jwt from 'jsonwebtoken';
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const lock_instruments_handlers_1 = require("../lock-instruments/lock-instruments.handlers");
const utils_1 = require("./utils");
const dayjs_1 = __importDefault(require("dayjs"));
const jwt = require("jsonwebtoken");
async function createReport(req, res, next) {
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const dataWithAllChild = req.body.data;
        const cfrData = req.body.cfrData;
        const newDataWithAllChild = await (0, convertToCurrentTimezone_1.default)(dataWithAllChild, ["updated_at", "created_at"]);
        const { set_points = [], set_points_table = [], performed_by = [], 
        // Above three won't have any data at the time of creation
        standard_details = [], ...rest } = newDataWithAllChild;
        const lockResult = await (0, lock_instruments_handlers_1.isCalInstLocked)(rest.cal_master_id);
        if (lockResult) {
            return res
                .status(429)
                .json({ message: "Calibration instrument is locked." });
        }
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            // create the report
            const createRes = await tx.calReport.create({
                data: {
                    ...rest,
                    standard_details: {
                        createMany: {
                            data: standard_details.map(({ _id, ...std }) => std),
                        },
                    },
                },
            });
            if (rest.request_type) {
                await tx.instrumentRequest.update({
                    where: {
                        id: rest.request_object_id,
                    },
                    data: {
                        status: "In Calibration",
                    },
                });
            }
            // update calibration-instrument status to 'InCalibration'
            if (rest.request_type !== "New Instrument") {
                await tx.instrumentCalibration.update({
                    where: {
                        id: rest.cal_master_id,
                    },
                    data: {
                        status: "InCalibration",
                    },
                });
            }
            // update all standard-instrument status to 'In Calibration'
            // for (const std of standard_details) {
            //   await tx.instrumentMaster.update({
            //     where: {
            //       id: std._id
            //     },
            //     data: {
            //       status: "In Calibration",
            //     },
            //   })
            // }
            // update calibration-Schedule schedule_status to 'Calibration'
            if (rest.calibration_schedule_id) {
                await tx.calibrationSchedule.update({
                    where: {
                        id: rest.calibration_schedule_id,
                    },
                    data: {
                        schedule_status: "Calibration",
                    },
                });
            }
            // create cfr
            await tx.cfr.create({
                data: cfrData,
            });
            // lock the instrument (std + cal)
            await (0, lock_instruments_handlers_1.lock)(newDataWithAllChild, decodedUser.email);
            return createRes;
        });
        const dataToSend = (0, utils_1.convertToIntMain)(transaction);
        res.status(201).json({
            data: dataToSend,
            message: "Calibration report created successfully",
        });
    }
    catch (err) {
        next(err);
    }
}
exports.createReport = createReport;
async function sendForApproval(req, res, next) {
    const reportId = req.params.id;
    const reportData = req.body.reportData;
    // const calInsData = req.body.calInsData;
    // Keep in mind that there are no child tables in any of the above data.
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const performedBy = [
            {
                email: user.email,
                signature: user.signature,
                timestamp: (0, dayjs_1.default)().toISOString(),
            },
        ];
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            const result = await tx.calReport.update({
                where: {
                    id: reportId,
                },
                data: {
                    ...reportData,
                    performed_by: {
                        createMany: {
                            data: performedBy,
                        },
                    },
                },
            });
            // if (result.calibration_schedule_id) {
            //   await tx.calibrationSchedule.update({
            //     where: {
            //       id: result.calibration_schedule_id,
            //     },
            //     data: {
            //       schedule_status: "Calibration",
            //       performed_by: {
            //         createMany: {
            //           data: performedBy
            //         }
            //       }
            //     }
            //   });
            // }
            // if (result.request_type !== 'Decommission') {
            //   await tx.instrumentCalibration.update({
            //     where: {
            //       id: result.cal_master_id ?? undefined,
            //     },
            //     data: calInsData
            //   });
            // }
            const cfrData = {
                timestamp: (0, dayjs_1.default)().valueOf(),
                user_name: user.username,
                email: user.email,
                role: user.role,
                module: "Reports",
                activity: "Report Sent for Approved",
                description: `Report Certificate no ${result.certificate_no_report} sent for approval by ${user.email} for Instrument ${result.instrument_id}`,
                method: "PUT",
            };
            await tx.cfr.create({
                data: cfrData,
            });
            return result;
        });
        const result = (0, utils_1.convertToIntMain)(transaction);
        res.status(200).json({
            data: result,
            message: "Report sent for approval.",
        });
    }
    catch (err) {
        next(err);
    }
}
exports.sendForApproval = sendForApproval;
async function approveReport(req, res, next) {
    const reportId = req.params.id;
    const calInsData = req.body.calInsData;
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const approvedBy = [
            {
                email: user.email,
                signature: user.signature,
                timestamp: (0, dayjs_1.default)().toISOString(),
            },
        ];
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            const resp = await tx.calReport.update({
                where: {
                    id: reportId,
                },
                data: {
                    status: "Approved",
                    time_of_approval: (0, dayjs_1.default)().valueOf(),
                    approved_by: {
                        createMany: {
                            data: approvedBy,
                        },
                    },
                },
                include: {
                    performed_by: true,
                },
            });
            if (resp.calibration_schedule_id) {
                await tx.calibrationSchedule.update({
                    where: {
                        id: resp.calibration_schedule_id,
                    },
                    data: {
                        schedule_status: "Completed",
                        performed_by: {
                            createMany: {
                                data: resp.performed_by.map((pb) => {
                                    return {
                                        email: pb.email,
                                        signature: pb.signature,
                                        timestamp: pb.timestamp,
                                    };
                                }),
                            },
                        },
                    },
                });
            }
            const report_status = resp.remarks_report
                ? resp.remarks_report.includes("Not")
                    ? false
                    : true
                : null;
            if (resp.request_type) {
                if (resp.request_type === "New Instrument") {
                    await tx.instrumentRequest.update({
                        where: {
                            id: resp.request_object_id ?? undefined,
                        },
                        data: {
                            status: "Ready for Active",
                            calibration_done_on: resp.calibration_done_on_report,
                            due_date: calInsData.due_date ?? null,
                            checked_by: user.email,
                            certificate_no: resp.certificate_no_report,
                            report_status: report_status,
                        },
                    });
                }
                else {
                    await tx.instrumentRequest.update({
                        where: {
                            id: resp.request_object_id ?? undefined,
                        },
                        data: {
                            status: "Ready for Confirmation",
                            checked_by: user.email,
                            certificate_no: resp.certificate_no_report,
                            report_status: report_status,
                        },
                    });
                    await tx.instrumentCalibration.update({
                        where: {
                            id: resp.cal_master_id ?? undefined,
                        },
                        data: {
                            ...calInsData,
                            // status: "Active",
                        },
                    });
                }
            }
            else {
                await tx.instrumentCalibration.update({
                    where: {
                        id: resp.cal_master_id ?? undefined,
                    },
                    data: {
                        ...calInsData,
                        // status: "Active",
                    },
                });
            }
            await tx.lockInstrument.deleteMany({
                where: {
                    cal_master_id: resp.cal_master_id,
                },
            });
            const cfrData = {
                timestamp: (0, dayjs_1.default)().valueOf(),
                user_name: user.username,
                email: user.email,
                role: user.role,
                module: "Reports",
                activity: "Report Approved",
                description: `Report approved with Certificate No ${resp.certificate_no_report} for Instrument ${resp.instrument_id} `,
                method: "PUT",
            };
            await tx.cfr.create({
                data: cfrData,
            });
            return resp;
        });
        const result = (0, utils_1.convertToIntMain)(transaction);
        res.status(200).json({
            data: result,
            message: "Calibration report approved successfully",
        });
    }
    catch (err) {
        next(err);
    }
}
exports.approveReport = approveReport;
async function deleteReport(req, res, next) {
    const reportId = req.params.id;
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            const resReport = await tx.calReport.update({
                where: {
                    id: reportId,
                },
                data: {
                    status: "Removed",
                },
                include: {
                    standard_details: true,
                },
            });
            if (resReport.calibration_schedule_id) {
                await tx.calibrationSchedule.update({
                    where: {
                        id: resReport.calibration_schedule_id,
                    },
                    data: {
                        status: "Active",
                        schedule_status: "Active",
                        checked_by: null,
                    },
                });
            }
            if (resReport.request_type) {
                await tx.instrumentRequest.update({
                    where: {
                        id: resReport.request_object_id ?? undefined,
                    },
                    data: {
                        status: "Ready for Calibration",
                    },
                });
            }
            if (resReport.request_type !== "New Instrument") {
                await tx.instrumentCalibration.update({
                    where: {
                        id: resReport.cal_master_id ?? undefined,
                    },
                    data: {
                        status: "Active",
                    },
                });
            }
            await index_1.prisma.lockInstrument.deleteMany({
                where: {
                    cal_master_id: resReport.cal_master_id,
                },
            });
            const cfrData = {
                timestamp: (0, dayjs_1.default)().valueOf(),
                user_name: user.username,
                email: user.email,
                role: user.role,
                module: "Reports",
                activity: "Report Removed",
                description: `Report deleted with Certificate No ${resReport.certificate_no_report} for Instrument ${resReport.instrument_id} `,
                method: "DELETE",
            };
            await tx.cfr.create({
                data: cfrData,
            });
            return resReport;
        });
        res.status(200).json({
            message: "Calibration report removed successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.deleteReport = deleteReport;
async function returnReport(req, res, next) {
    const reportId = req.params.id;
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            const resReport = await tx.calReport.update({
                where: {
                    id: reportId,
                },
                data: {
                    status: "In Calibration",
                },
            });
            await tx.performed_By_User.deleteMany({
                where: {
                    calReportId: reportId,
                },
            });
            const cfrData = {
                timestamp: (0, dayjs_1.default)().valueOf(),
                user_name: user.username,
                email: user.email,
                role: user.role,
                module: "Reports",
                activity: "Report Returned",
                description: `Report returned with Certificate No ${resReport.certificate_no_report} for Instrument ${resReport.instrument_id} `,
                method: "PUT",
            };
            await tx.cfr.create({
                data: cfrData,
            });
            return resReport;
        });
        const result = (0, utils_1.convertToIntMain)(transaction);
        res.status(200).json({
            data: result,
            message: "Calibration report returned successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.returnReport = returnReport;
async function bulkReturnReport(req, res, next) {
    const reportsDataWithIdAndRemarks = req.body;
    const reportIds = reportsDataWithIdAndRemarks.map((report) => report.id);
    const remarks = reportsDataWithIdAndRemarks.map((report) => report.remarks)[0]; // remark will be the same for all.
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            const resReport = await tx.calReport.updateMany({
                where: {
                    id: {
                        in: reportIds,
                    },
                },
                data: {
                    status: "In Calibration",
                    remarks: remarks,
                },
            });
            await tx.performed_By_User.deleteMany({
                where: {
                    calReportId: {
                        in: reportIds,
                    },
                },
            });
            const cfrData = {
                timestamp: (0, dayjs_1.default)().valueOf(),
                user_name: user.username,
                email: user.email,
                role: user.role,
                module: "Reports",
                activity: "Reports Returned",
                description: `${resReport.count} Calibration report(s) have been returned with Remarks - ${remarks ?? ""}`,
                method: "PUT",
            };
            await tx.cfr.create({
                data: cfrData,
            });
            return resReport.count;
        });
        res.status(200).json({
            message: `${transaction} Calibration report(s) returned successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}
exports.bulkReturnReport = bulkReturnReport;
async function bulkApproveReport(req, res, next) {
    const dataList = req.body;
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const transactionPromises = [];
        for (const { reportData, calInsData } of dataList) {
            transactionPromises.push(index_1.prisma.$transaction(async (tx) => {
                const resReport = await tx.calReport.update({
                    where: {
                        id: reportData.id,
                    },
                    data: {
                        status: "Approved",
                        remarks: reportData.remarks,
                        time_of_approval: (0, dayjs_1.default)().valueOf(),
                    },
                    include: {
                        performed_by: true,
                    },
                });
                if (resReport.calibration_schedule_id) {
                    await tx.calibrationSchedule.update({
                        where: {
                            id: resReport.calibration_schedule_id,
                        },
                        data: {
                            schedule_status: "Completed",
                            performed_by: {
                                createMany: {
                                    data: resReport.performed_by.map((pb) => {
                                        return {
                                            email: pb.email,
                                            signature: pb.signature,
                                            timestamp: pb.timestamp,
                                        };
                                    }),
                                },
                            },
                        },
                    });
                }
                const report_status = resReport.remarks_report
                    ? resReport.remarks_report.includes("Not")
                        ? false
                        : true
                    : null;
                if (resReport.request_type) {
                    if (resReport.request_type === "New Instrument") {
                        await tx.instrumentRequest.update({
                            where: {
                                id: resReport.request_object_id ?? undefined,
                            },
                            data: {
                                status: "Ready for Active",
                                calibration_done_on: resReport.calibration_done_on_report,
                                due_date: calInsData.due_date ?? null,
                                checked_by: user.email,
                                certificate_no: resReport.certificate_no_report,
                                report_status: report_status,
                            },
                        });
                    }
                    else {
                        await tx.instrumentRequest.update({
                            where: {
                                id: resReport.request_object_id ?? undefined,
                            },
                            data: {
                                status: "Ready for Confirmation",
                                checked_by: user.email,
                                certificate_no: resReport.certificate_no_report,
                                report_status: report_status,
                            },
                        });
                        await tx.instrumentCalibration.update({
                            where: {
                                id: resReport.cal_master_id ?? undefined,
                            },
                            data: {
                                ...calInsData,
                                // status: "Active",
                            },
                        });
                    }
                }
                else {
                    await tx.instrumentCalibration.update({
                        where: {
                            id: resReport.cal_master_id ?? undefined,
                        },
                        data: {
                            ...calInsData,
                            // status: "Active",
                        },
                    });
                }
                await tx.lockInstrument.deleteMany({
                    where: {
                        cal_master_id: resReport.cal_master_id ?? undefined,
                    },
                });
                await tx.approved_By_User.create({
                    data: {
                        email: user?.email,
                        signature: user?.signature,
                        calReportId: reportData.id,
                        timestamp: (0, dayjs_1.default)().toISOString(),
                    },
                });
            }, {
                maxWait: 30000,
                timeout: 60000,
            }));
        }
        const transactions = await Promise.allSettled(transactionPromises);
        const successTransactions = transactions.filter((result) => result.status === "fulfilled");
        const failedTransactions = transactions.filter((result) => result.status === "rejected");
        const successCount = successTransactions.length;
        const failedCount = failedTransactions.length;
        const cfrData = {
            timestamp: (0, dayjs_1.default)().valueOf(),
            user_name: user.username,
            email: user.email,
            role: user.role,
            module: "Reports",
            activity: "Reports Approved",
            description: `${successCount} Calibration report(s) have been approved with remarks - ${dataList[0].reportData.remarks ?? ""}`,
            method: "PUT",
        };
        if (failedCount > 0) {
            cfrData.description = `${successCount} Calibration report(s) approved successfully. ${failedCount} Calibration report(s) failed to approve.`;
        }
        const respToSend = failedCount > 0
            ? {
                message: `${successCount} Calibration report(s) approved successfully. ${failedCount} Calibration report(s) failed to approve.`,
                failedCount: failedCount,
                successCount: successCount,
                errorMessage: failedTransactions.map((error) => error.reason),
            }
            : {
                message: `${successCount} Calibration report(s) approved successfully.`,
                successCount: successCount,
                failedCount: failedCount,
            };
        try {
            await index_1.prisma.cfr.create({
                data: cfrData,
            });
        }
        catch (error) {
            return res.status(200).json({
                ...respToSend,
                cfrError: error.message,
            });
        }
        res.status(200).json(respToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.bulkApproveReport = bulkApproveReport;
async function updateOneRN(req, res, next) {
    const reportId = req.params.id;
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            "updated_at",
        ]);
        const { performed_by = [], set_points = [], set_points_table = [], standard_details = [], approved_by = [], ...restData } = newData;
        const dataWithoutSPT = (0, utils_1.calRepConvertToPrismaDataWithoutSPT)(newData);
        const transaction = await index_1.prisma.$transaction(async (tx) => {
            // set_points_table and Nested Set Points
            if (newData?.set_points_table?.length > 0) {
                const SetPointTableAll = newData.set_points_table;
                for (let i = 0; i < SetPointTableAll.length; i++) {
                    const set_points_tableFull = SetPointTableAll[i];
                    const { set_points = [], ...set_points_table } = set_points_tableFull;
                    if (set_points_table._id) {
                        await tx.set_Point_Table.update({
                            where: {
                                id: set_points_table._id,
                            },
                            data: (0, utils_1.removeIDFields)(set_points_table),
                        });
                        // Set Points
                        const setPointsAll = SetPointTableAll[i].set_points;
                        const tableId = set_points_table._id;
                        if (setPointsAll.length > 0) {
                            for (let i = 0; i < setPointsAll?.length; i++) {
                                const set_point = setPointsAll[i];
                                if (set_point._id) {
                                    await tx.set_Point_calR.update({
                                        where: {
                                            id: set_point._id,
                                        },
                                        data: (0, utils_1.removeIDFields)(set_point),
                                    });
                                }
                                else {
                                    await tx.set_Point_calR.create({
                                        data: {
                                            ...set_point,
                                            calReportId: reportId,
                                            setPointTableId: tableId,
                                        },
                                    });
                                }
                            }
                        }
                    }
                    else {
                        const set_points_tableFull = SetPointTableAll[i];
                        const { set_points = [], ...set_points_table } = set_points_tableFull;
                        const SPTTable = await tx.set_Point_Table.create({
                            data: {
                                ...set_points_table,
                                calReportId: reportId,
                            },
                        });
                        // Set Points
                        if (set_points.length > 0) {
                            const tableId = SPTTable.id;
                            const setPointsAll = set_points_tableFull.set_points;
                            for (let i = 0; i < setPointsAll.length; i++) {
                                const set_point = setPointsAll[i];
                                const STPT = (0, utils_1.removeIDFields)(set_point);
                                if (set_point._id) {
                                    await tx.set_Point_calR.update({
                                        where: {
                                            id: set_point._id,
                                        },
                                        data: (0, utils_1.removeIDFields)(set_point),
                                    });
                                }
                                else {
                                    await tx.set_Point_calR.create({
                                        data: {
                                            ...set_point,
                                            calReportId: reportId,
                                            setPointTableId: tableId,
                                        },
                                    });
                                }
                            }
                        }
                    }
                }
            }
            // Performed By
            if (newData.status === "Ready for Approval") {
                if (newData.performed_by && newData.performed_by.length > 0) {
                    if (newData.performed_by[0]._id) {
                        await tx.performed_By_User.update({
                            where: {
                                id: newData.performed_by[0]._id,
                            },
                            data: {
                                calReportId: reportId,
                                email: decodedUser.email,
                                signature: decodedUser.signature,
                                timestamp: (0, dayjs_1.default)(newData?.time_of_approval).toISOString(),
                            },
                        });
                    }
                    else {
                        await tx.performed_By_User.create({
                            data: {
                                calReportId: reportId,
                                email: decodedUser.email,
                                signature: decodedUser.signature,
                                timestamp: (0, dayjs_1.default)(newData?.time_of_approval)
                                    .toISOString(),
                            },
                        });
                    }
                }
            }
            // Report
            const updateResp = await tx.calReport.update({
                where: {
                    id: reportId,
                },
                data: (0, utils_1.removeIDFields)(restData),
                include: {
                    performed_by: true,
                    set_points: true,
                    set_points_table: {
                        include: {
                            set_points: true,
                        },
                    },
                    standard_details: true,
                },
            });
            return updateResp;
        });
        const dataToSend = (0, utils_1.convertFromPrismaData)(transaction);
        res.status(201).json({
            data: dataToSend,
            message: "Calibration report created successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
exports.updateOneRN = updateOneRN;
//# sourceMappingURL=cal-reports-opt.handlers.js.map