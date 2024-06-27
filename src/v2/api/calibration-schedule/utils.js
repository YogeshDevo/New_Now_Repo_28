"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFromPrismaData = exports.convertToPrismaData = void 0;
const changeIdTo_id = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
    };
    return result;
};
const convertToInt = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
        calibration_done_on: Number(data?.calibration_done_on),
        due_date: Number(data?.due_date),
    };
    return result;
};
const convertToPrismaData = (data) => {
    const { std_used = [], performed_by = [], ...rest } = data;
    const result = {
        ...rest,
        performed_by: {
            createMany: {
                data: performed_by.map((pb) => {
                    return {
                        email: pb.email,
                        signature: pb.signature,
                        timestamp: pb.timestamp,
                    };
                }),
            },
        },
        std_used: {
            createMany: {
                data: std_used.map(content => ({
                    std_string: content,
                })),
            },
        },
    };
    return result;
};
exports.convertToPrismaData = convertToPrismaData;
const convertFromPrismaData = (data) => {
    const { std_used = [], performed_by = [], ...restWithId } = data;
    const result = {
        ...(convertToInt(restWithId)),
        performed_by: performed_by.map(pb => changeIdTo_id(pb)),
        std_used: std_used.map(su => su.std_string ?? ''),
    };
    return result;
};
exports.convertFromPrismaData = convertFromPrismaData;
//# sourceMappingURL=utils.js.map