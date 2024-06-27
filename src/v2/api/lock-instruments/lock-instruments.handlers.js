"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLockInstruments = exports.lock = exports.isCalInstLocked = exports.findOne = void 0;
const prisma_1 = require("../../../../prisma");
const utils_1 = require("../../utils");
const k = 2;
async function findOne(req, res, next) {
    try {
        const result = await prisma_1.prisma.lockInstrument.findMany({
            where: {
                standard_instrument_id: req.query.instrument_id?.toString(),
            },
        });
        if (result.length !== 0) {
            if (result[0]?.user_id === req.params.id) {
                if (result.length < k) {
                    return res.json({ maxLimitOverLoaded: false });
                }
                else {
                    return res.json({ maxLimitOverLoaded: true });
                }
            }
            else {
                return res.json({ userAllowed: false });
            }
        }
        else {
            return res.json({ maxLimitOverLoaded: false });
        }
    }
    catch (error) {
        next(error);
    }
}
exports.findOne = findOne;
async function isCalInstLocked(instrument_id) {
    try {
        const result = await prisma_1.prisma.lockInstrument.findFirst({
            where: {
                cal_master_id: instrument_id?.toString(),
            },
        });
        return result;
        // if (result.length !== 0) {
        //   if (result[0]?.user_id === req.params.id) {
        //     if (result.length < k) {
        //       return res.json({ maxLimitOverLoaded: false });
        //     } else {
        //       return res.json({ maxLimitOverLoaded: true });
        //     }
        //   } else {
        //     return res.json({ userAllowed: false });
        //   }
        // } else {
        //   return res.json({ maxLimitOverLoaded: false });
        // }
    }
    catch (error) {
        return false;
    }
}
exports.isCalInstLocked = isCalInstLocked;
// export async function lock(body: any, id: string) {
//   try {
//     //
//     let obj: MyObject[] = [];
//     const user = await prisma.user.findUnique({
//       where: {
//         email: id,
//       },
//     });
//     //
//     if (user && user.id) {
//       const cal_master_id = body.cal_master_id;
//       body.standard_details?.forEach((data: any) => {
//         let obj1: MyObject = {
//           standard_instrument_id: data.instrument_id_no,
//           user_id: user?.id,
//           cal_master_id: cal_master_id,
//         };
//         obj.push(obj1);
//       });
//       const result = await prisma.lockInstrument.createMany({ data: obj });
//       if (!result) {
//         throw new Error('Error inserting lockInstrument.');
//       }
//       return true;
//     } else {
//       return false;
//     }
//   } catch (error) {
//     return false;
//   }
// }
async function lock(body, id) {
    try {
        //
        const obj = [];
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email: id,
            },
        });
        if (user && user.id) {
            const cal_master_id = body.cal_master_id;
            const prismaTransaction = await prisma_1.prisma.$transaction(async (tx) => {
                const insertResult = await Promise.all(body.standard_details.map(async (uploadData) => {
                    const executeFn = async () => {
                        const resp = await tx.lockInstrument.create({
                            data: {
                                standard_instrument_id: uploadData.instrument_id_no,
                                user_id: user?.id,
                                cal_master_id: cal_master_id,
                            },
                        });
                        return resp;
                    };
                    return (0, utils_1.retryAsyncFunction)(executeFn, 50);
                }));
                return insertResult;
            }, {
                maxWait: 20000,
                timeout: 60000,
            });
            if (!prismaTransaction) {
                throw new Error('Error inserting lockInstrument.');
            }
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
}
exports.lock = lock;
async function deleteLockInstruments(body, id) {
    try {
        const cal_master_id = body.cal_master_id;
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email: id,
            },
        });
        if (user && user.id) {
            await prisma_1.prisma.lockInstrument.deleteMany({
                where: { cal_master_id: cal_master_id },
            });
            // body.standard_details?.forEach(async (data: any) => {
            //   let obj: MyObject = {
            //     standard_instrument_id: data.instrument_id_no,
            //     user_id: user?.id,
            //     cal_master_id: cal_master_id,
            //   };
            //   await prisma.lockInstrument.deleteMany({ where: obj });
            // });
        }
        else {
            return false;
        }
    }
    catch (error) {
        throw error;
    }
}
exports.deleteLockInstruments = deleteLockInstruments;
//# sourceMappingURL=lock-instruments.handlers.js.map