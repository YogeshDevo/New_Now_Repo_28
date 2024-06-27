"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFromPrismaData = exports.convertToPrismaData = void 0;
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
    // result.std_used = data?.std_used?.map((std: any) => {
    //   return std.std_string;
    // })
    return result;
};
const convertToPrismaData = (data) => {
    const { std_used = [], ...rest } = data;
    const result = {
        ...rest,
        ...(std_used.length > 0 && {
            std_used: {
                createMany: {
                    data: std_used.map(content => ({
                        std_string: content,
                    })),
                },
            },
        }),
    };
    return result;
};
exports.convertToPrismaData = convertToPrismaData;
const convertFromPrismaData = (data) => {
    const { std_used = [], ...restWithId } = data;
    const result = {
        ...(convertToInt(restWithId)),
        std_used: std_used.map(su => su.std_string ?? ''),
    };
    return result;
};
exports.convertFromPrismaData = convertFromPrismaData;
//# sourceMappingURL=utils.js.map