"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetOne = exports.deleteAll = exports.deleteOne = exports.approveMany = exports.updateMany = exports.updateOne = exports.findOne = exports.createOne = exports.findAll = exports.findAllCount = void 0;
const lock_instruments_handlers_1 = require("../lock-instruments/lock-instruments.handlers");
const convertToCurrentTimezone_1 = __importDefault(require("../../utilities/convertToCurrentTimezone"));
const prisma_1 = require("../../../../prisma");
const utils_1 = require("./utils");
const dayjs_1 = __importDefault(require("dayjs"));
const cfr_helper_1 = require("../cfr/cfr.helper");
// import { io } from '../..';
// let changeStream: ChangeStream;
// function setupChangeStream() {
//   if (!changeStream) {
//     changeStream = Todos.watch();
//     changeStream.on('change', (changeEvent: ChangeStreamEvents<Todo>) => {
//       // Emit the change to connected clients
//       //
//       io.emit('update', { message: 'Data updated!', changeEvent });
//     });
//   }
// }
const jwt = require('jsonwebtoken');
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
    };
    return result;
};
//Count
async function findAllCount(req, res, next) {
    try {
        const result = await prisma_1.prisma.calReport.count();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.findAllCount = findAllCount;
//
async function findAll(req, res, next) {
    try {
        // setupChangeStream();
        // Get start and end timestamps from query parameters
        let startTimestamp, endTimestamp;
        if (typeof req.query.startDate === 'string') {
            startTimestamp = parseInt(req.query.startDate, 10);
        }
        if (typeof req.query.endDate === 'string') {
            endTimestamp = parseInt(req.query.endDate, 10);
        }
        // -------------------------------------------------------------------------
        const where = {
            calibration_done_on_report: {
                ...(startTimestamp && { gte: startTimestamp }),
                ...(endTimestamp && { lt: endTimestamp }),
            },
        };
        const batchSize = parseInt(process.env.BATCH_SIZE || '1000');
        let offset = 0;
        let respData = [];
        while (true) {
            const batch = await prisma_1.prisma.calReport.findMany({
                where,
                include: {
                    performed_by: true,
                    // set_points: true,
                    set_points_table: {
                        include: {
                            set_points: true,
                        },
                    },
                    standard_details: true,
                },
                skip: offset,
                take: batchSize,
            });
            if (batch.length === 0) {
                break;
            }
            respData = respData.concat(batch);
            offset += batchSize;
        }
        const result = respData;
        const dataToSend = result.map((data) => (0, utils_1.convertFromPrismaData)(data));
        return res.json(dataToSend);
        // -------------------------------------------------------------------------
    }
    catch (error) {
        next(error);
    }
}
exports.findAll = findAll;
async function createOne(req, res, next) {
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const lockResult = await (0, lock_instruments_handlers_1.isCalInstLocked)(req.body.cal_master_id);
        if (lockResult) {
            return res
                .status(429)
                .json({ message: 'Calibration instrument is locked.' });
        }
        if (true) {
            const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
                'updated_at',
                'created_at',
            ]);
            const insertResult = await prisma_1.prisma.$transaction(async (tx) => {
                const dataWithoutSPT = (0, utils_1.calRepConvertToPrismaDataWithoutSPT)(newData);
                await (0, lock_instruments_handlers_1.lock)(req.body, decodedUser.email);
                const createRes = await tx.calReport.create({
                    data: dataWithoutSPT,
                    include: {
                        performed_by: true,
                        approved_by: true,
                        set_points: true,
                        set_points_table: {
                            include: {
                                set_points: true,
                            },
                        },
                        standard_details: true,
                    },
                });
                if (newData?.set_points_table.length > 0) {
                    const promises = newData.set_points_table.map(({ set_points, ...spt }) => {
                        return tx.set_Point_Table.create({
                            data: {
                                ...spt,
                                calReportId: createRes.id,
                                set_points: {
                                    createMany: {
                                        data: set_points ?? [],
                                    },
                                },
                            },
                        });
                    });
                    await Promise.all(promises);
                }
                return createRes;
            });
            if (!insertResult)
                throw new Error('Error inserting todo.');
            const dataToSend = (0, utils_1.convertFromPrismaData)(insertResult);
            res.status(201);
            res.json(dataToSend);
        }
        else {
        }
    }
    catch (error) {
        next(error);
    }
}
exports.createOne = createOne;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.calReport.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                performed_by: true,
                approved_by: true,
                set_points: true,
                set_points_table: {
                    include: {
                        set_points: true,
                    },
                },
                standard_details: true,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        const dataToSend = (0, utils_1.convertFromPrismaData)(result);
        const newSPT = dataToSend?.set_points_table?.map((d) => {
            d.least_count = (d.least_count === null ? 'NA' : d.least_count);
            return d;
        });
        const newDataToSend = {
            ...dataToSend,
            set_points_table: newSPT,
        };
        res.json(newDataToSend);
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function updateOne(req, res, next) {
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const newData = await (0, convertToCurrentTimezone_1.default)(req.body, [
            'updated_at',
        ]);
        const { performed_by = [], set_points = [], set_points_table = [], standard_details = [], status, ...restData } = newData;
        const dataWithoutSPT = (0, utils_1.calRepConvertToPrismaDataWithoutSPT)(newData);
        const resp = await prisma_1.prisma.$transaction(async (tx) => {
            // Delete old data ------------------------------
            if (performed_by.length > 0) {
                await tx.performed_By_User.deleteMany({
                    where: {
                        calReportId: req.params.id,
                    },
                });
            }
            if (set_points.length > 0) {
                await tx.set_Point_calR.deleteMany({
                    where: {
                        calReportId: req.params.id,
                    },
                });
            }
            if (set_points_table.length > 0) {
                await tx.set_Point_Table.deleteMany({
                    where: {
                        calReportId: req.params.id,
                    },
                });
            }
            if (standard_details.length > 0) {
                await tx.standard_Detail.deleteMany({
                    where: {
                        calReportId: req.params.id,
                    },
                });
            }
            // old data deleted -----------------------------
            // Insert in set_points_table
            if (set_points_table.length > 0) {
                const promises = set_points_table.map(({ set_points, ...spt }) => {
                    return tx.set_Point_Table.create({
                        data: {
                            ...spt,
                            least_count: spt.least_count === 'NA' ? null : spt.least_count,
                            calReportId: req.params.id,
                            set_points: {
                                createMany: {
                                    data: set_points ?? [],
                                },
                            },
                        },
                    });
                });
                await Promise.all(promises);
            }
            const updateResp = await tx.calReport.update({
                where: {
                    id: req.params.id,
                },
                data: dataWithoutSPT,
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
        const result = (0, utils_1.convertFromPrismaData)(resp);
        if (status === "Approved" ||
            status === "Rejected" ||
            status === "Discarded" ||
            status === "Removed") {
            await (0, lock_instruments_handlers_1.deleteLockInstruments)(result, decodedUser.email);
            const standardsFound = await prisma_1.prisma.standard_Detail.findMany({
                where: {
                    calReportId: req.params.id,
                },
            });
            standardsFound.map(async (standard_Detail) => {
                const response = await prisma_1.prisma.instrumentMaster.updateMany({
                    where: {
                        instrument_id_no: standard_Detail.instrument_id_no,
                    },
                    data: {
                        status: 'Active',
                    },
                });
                return response;
            });
        }
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
exports.updateOne = updateOne;
async function updateMany(req, res, next) {
    const datalist = req.body;
    const newDataList = await Promise.all(datalist.map(async (data) => {
        return (0, convertToCurrentTimezone_1.default)(data, ['updated_at']);
    }));
    const cfrDescription = {
        ReadyforApproval: 'Reviewed',
        Active: 'Approved',
        Draft: 'Returned',
        Discarded: 'Rejected',
    };
    const cfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        module: 'Calibration Report',
        method: req.method,
        activity: 'UPDATE',
        updated_at: (0, dayjs_1.default)().valueOf(),
    };
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        const transactionPromises = [];
        for (const { _id, ...newData } of newDataList) {
            const { performed_by = [], approved_by = [], set_points = [], set_points_table = [], standard_details = [], ...restData } = newData;
            standard_details.forEach((sd) => {
                delete sd._id;
                delete sd.calReportId;
                return sd;
            });
            const dataWithoutSPT = (0, utils_1.calRepConvertToPrismaDataWithoutSPT)(newData);
            transactionPromises.push(prisma_1.prisma.$transaction(async (tx) => {
                // Delete old data ------------------------------
                if (performed_by.length > 0) {
                    await tx.performed_By_User.deleteMany({
                        where: {
                            calReportId: _id,
                        },
                    });
                }
                if (approved_by.length > 0) {
                    await tx.approved_By_User.deleteMany({
                        where: {
                            calReportId: _id,
                        },
                    });
                }
                if (set_points.length > 0) {
                    await tx.set_Point_calR.deleteMany({
                        where: {
                            calReportId: _id,
                        },
                    });
                }
                // [WE DON'T NEED THIS BECAUSE WE ARE NOT MANIPULATING THE SET_POINTS TABLE IN MULTIPLE SELECTIONS]
                // if (set_points_table.length > 0) {
                //   await tx.set_Point_Table.deleteMany({
                //     where: {
                //       calReportId: _id,
                //     },
                //   });
                //
                // }
                if (standard_details.length > 0) {
                    await tx.standard_Detail.deleteMany({
                        where: {
                            calReportId: _id,
                        },
                    });
                }
                // old data deleted -----------------------------
                // Insert in set_points_table [WE DON'T NEED THIS BECAUSE WE ARE NOT MANIPULATING THE SET_POINTS TABLE IN MULTIPLE SELECTIONS]
                // if (set_points_table.length > 0) {
                //   for (const { set_points, ...spt } of set_points_table) {
                //     delete spt._id;
                //     set_points.forEach((set_point: any) => {
                //       delete set_point.setPointTableId;
                //       delete set_point._id;
                //       return set_point;
                //     })
                //
                //
                //     try {
                //       await tx.set_Point_Table.create({
                //         data: {
                //           ...spt,
                //           least_count: spt.least_count === 'NA' ? null : spt.least_count,
                //           set_points: {
                //             createMany: {
                //               data: set_points ?? [],
                //             },
                //           },
                //         },
                //       });
                //     } catch (error) {
                //
                //     }
                //   }
                //
                // }
                try {
                    const updateResp = await tx.calReport.update({
                        where: {
                            id: _id,
                        },
                        data: dataWithoutSPT,
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
                }
                catch (error) {
                    throw error;
                }
            }));
        }
        const resp = await Promise.allSettled(transactionPromises);
        const updatedDataCount = resp.filter((r) => r.status === 'fulfilled').length;
        // await prisma.$transaction(async (tx) => {
        //   const updatePromises = datalist.map(async ({ _id, ...data }: any) => {
        //     const prev = await tx.calReport.findUnique({
        //       where: { id: _id },
        //     });
        //     if (!prev) {
        //       res.status(404);
        //       throw new Error(`Report with id "${_id}" not found.`);
        //     }
        //     const {
        //       performed_by = [],
        //       set_points = [],
        //       set_points_table = [],
        //       standard_details = [],
        //       ...restData
        //     } = data;
        //
        //     const dataWithoutSPT = calRepConvertToPrismaDataWithoutSPT(data);
        //     // delete dataWithoutSPT.set_points;
        //     // delete dataWithoutSPT.performed_by;
        //     // delete dataWithoutSPT.standard_details;
        //     // delete dataWithoutSPT.approved_by;
        //     await tx.calReport.update({
        //       where: { id: _id },
        //       data: dataWithoutSPT,
        //       include: {
        //         performed_by: true,
        //         set_points_table: {
        //           include: {
        //             set_points: true
        //           }
        //         },
        //         standard_details: true
        //       }
        //     });
        //   });
        //   await Promise.all(updatePromises);
        // });
        if (user) {
            cfrData.user_name = user?.username;
            cfrData.email = user?.email ?? req.body?.emailusername;
            cfrData.role = user?.role;
            cfrData.description = `${updatedDataCount} records of reports's ${datalist.length > 1 ? 'are' : 'is'} ${cfrDescription[datalist[0].status ?? 'Approved']} by ${user.username}.`;
            try {
                await (0, cfr_helper_1.cfrCreateHelper)({
                    data: cfrData,
                });
            }
            catch (err) { }
        }
        let instStatus = datalist[0]?.status;
        let message = instStatus;
        res.json(`${updatedDataCount} ${updatedDataCount > 1 ? "Report" : "Reports"} ${message} successfully.`);
        // res.status(404).json({ message: 'Successfully completed' });
    }
    catch (error) {
        next(error);
    }
}
exports.updateMany = updateMany;
async function approveMany(req, res, next) {
    const datalist = req.body;
    const newDataList = await Promise.all(datalist.map(async (data) => {
        return (0, convertToCurrentTimezone_1.default)(data, ["updated_at"]);
    }));
    const cfrData = {
        timestamp: (0, dayjs_1.default)().valueOf(),
        module: "Calibration Report",
        method: req.method,
        activity: "UPDATE",
        updated_at: (0, dayjs_1.default)().valueOf(),
    };
    try {
        const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: decodedUser.email },
        });
        const transactionPromises = [];
        for (const { _id, ...newData } of newDataList) {
            const { performed_by = [], approved_by = [], set_points = [], set_points_table = [], standard_details = [], ...restData } = newData;
            transactionPromises.push(prisma_1.prisma.$transaction(async (tx) => {
                await tx.calReport.update({
                    where: {
                        id: _id,
                    },
                    data: restData,
                });
                if (newData.calibration_schedule_id) {
                    await tx.calibrationSchedule.update({
                        where: {
                            id: newData.calibration_schedule_id
                        },
                        data: {
                            schedule_status: "Completed",
                        }
                    });
                }
                if (newData.request_type) {
                    if (newData.request_type === "New Instrument") {
                        await tx.instrumentRequest.update({
                            where: {
                                id: newData.request_object_id
                            },
                            data: {
                                status: "Ready for Active",
                            }
                        });
                    }
                    else {
                        await tx.instrumentRequest.update({
                            where: {
                                id: newData.request_object_id
                            },
                            data: {
                                status: newData.request_type === "Decommission" ? "Ready for Review" : "Ready for Confirmation",
                            }
                        });
                        await tx.instrumentCalibration.update({
                            where: {
                                id: newData.cal_master_id
                            },
                            data: {
                                status: "Active",
                            }
                        });
                    }
                }
                else {
                    await tx.instrumentCalibration.update({
                        where: {
                            id: newData.cal_master_id
                        },
                        data: {
                            status: "Active",
                        }
                    });
                }
                await tx.lockInstrument.deleteMany({
                    where: {
                        cal_master_id: newData.cal_master_id
                    }
                });
                await tx.approved_By_User.create({
                    data: {
                        email: user?.email,
                        signature: user?.signature,
                        calReportId: _id,
                        timestamp: (0, dayjs_1.default)().valueOf().toString()
                    }
                });
            }));
        }
        const resp = await Promise.allSettled(transactionPromises);
        const updatedDataCount = resp.filter((r) => r.status === "fulfilled").length;
        if (user) {
            cfrData.user_name = user?.username;
            cfrData.email = user?.email ?? req.body?.emailusername;
            cfrData.role = user?.role;
            cfrData.description = `${updatedDataCount} record(s) of reports are Approved by ${user.username}.`;
            try {
                await prisma_1.prisma.cfr.create({
                    data: cfrData,
                });
            }
            catch (err) { }
        }
        let instStatus = datalist[0]?.status;
        let message = instStatus;
        res.json(`${updatedDataCount} ${updatedDataCount > 1 ? "Report" : "Reports"} ${message} successfully.`);
        // res.status(404).json({ message: 'Successfully completed' });
    }
    catch (error) {
        next(error);
    }
}
exports.approveMany = approveMany;
async function deleteOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.calReport.delete({
            where: {
                id: req.params.id,
            },
        });
        if (!result) {
            res.status(404);
            throw new Error(`Todo with id "${req.params.id}" not found.`);
        }
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}
exports.deleteOne = deleteOne;
async function deleteAll(req, res, next) {
    try {
        const results = await prisma_1.prisma.calReport.deleteMany({});
        if (!results) {
            res.status(404);
            throw new Error('Calibration reportnot found.');
        }
        res.json(`${results?.count} records of Calibration report have been deleted`);
    }
    catch (error) {
        next(error);
    }
}
exports.deleteAll = deleteAll;
async function resetOne(req, res, next) {
    const decodedUser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    try {
        const calibrationReportFound = await prisma_1.prisma.calReport.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                standard_details: true,
            },
        });
        const instrumentId = calibrationReportFound?.instrument_id;
        const scheduleId = calibrationReportFound?.calibration_schedule_id;
        const calMasterId = calibrationReportFound?.cal_master_id;
        if (!calibrationReportFound) {
            res.status(404);
            throw new Error(`Calibration report with id "${req.params.id}" not found.`);
        }
        // await prisma.calibrationSchedule.updateMany({
        //   where: {
        //     instrument_id: instrumentId,
        //     _id : scheduleId,
        //   },
        //   data: {
        //     status: "Active",
        //     schedule_status: "Active",
        //   },
        // });
        await prisma_1.prisma.calibrationSchedule.update({
            where: {
                instrument_id: instrumentId,
                id: scheduleId,
            },
            data: {
                status: 'Active',
                schedule_status: 'Active',
            },
        });
        await prisma_1.prisma.lockInstrument.deleteMany({
            where: { cal_master_id: calMasterId },
        });
        // BUG  -------
        if (calibrationReportFound &&
            calibrationReportFound?.instrument_id &&
            typeof calibrationReportFound?.instrument_id === 'string') {
            await prisma_1.prisma.instrumentCalibration.updateMany({
                where: {
                    instrument_id: instrumentId,
                },
                data: {
                    status: 'Active',
                },
            });
        }
        const standardsUpdated = calibrationReportFound?.standard_details?.map(async (standardDetailItem) => {
            await prisma_1.prisma.instrumentMaster.updateMany({
                where: {
                    instrument_id_no: standardDetailItem.instrument_id_no,
                },
                data: {
                    status: 'Active',
                },
            });
        });
        Promise.all(standardsUpdated).then(async () => {
            const result = await prisma_1.prisma.calReport.update({
                where: {
                    id: req.params.id,
                },
                data: {
                    status: 'Removed',
                },
            });
            if (!result) {
                res.status(404);
                throw new Error(`Calibration report with id "${req.params.id}" not found.`);
            }
            res.status(204).end();
        });
    }
    catch (error) {
        next(error);
    }
}
exports.resetOne = resetOne;
//# sourceMappingURL=cal-reports.handlers.js.map