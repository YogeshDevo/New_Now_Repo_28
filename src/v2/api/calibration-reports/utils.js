"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeIDFields = exports.convertFromPrismaData = exports.calRepConvertToPrismaDataWithoutSPT = exports.convertToIntMain = void 0;
const changeIdTo_id = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
    };
    return result;
};
const convertToIntSD = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        cal_date: Number(data?.cal_date),
        due_date: Number(data?.due_date),
    };
    return result;
};
const convertToIntMain = (dataWithId) => {
    const { id, ...data } = dataWithId;
    const result = {
        ...data,
        _id: id,
        updated_at: Number(data?.updated_at),
        created_at: Number(data?.created_at),
        calibration_done: Number(data?.calibration_done),
        calibration_due_date: Number(data?.calibration_due_date),
        calibration_done_on_report: Number(data?.calibration_done_on_report),
        calibration_due_on_report: Number(data?.calibration_due_on_report),
        time_of_calibration: Number(data?.time_of_calibration),
        time_of_approval: Number(data?.time_of_approval),
    };
    return result;
};
exports.convertToIntMain = convertToIntMain;
const calRepConvertToPrismaDataWithoutSPT = (data) => {
    const { performed_by = [], approved_by = [], set_points = [], set_points_table = [], standard_details = [], ...rest } = data;
    const result = {
        ...rest,
        least_count: rest.least_count ?? '',
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
        approved_by: {
            createMany: {
                data: approved_by.map((pb) => {
                    return {
                        email: pb.email,
                        signature: pb.signature,
                        timestamp: pb.timestamp,
                    };
                }),
            },
        },
        set_points: {
            createMany: {
                data: set_points,
            },
        },
        standard_details: {
            createMany: {
                data: standard_details,
            },
        },
    };
    // const SPTCreateData: Prisma.Set_Point_TableCreateInput =
    return result;
};
exports.calRepConvertToPrismaDataWithoutSPT = calRepConvertToPrismaDataWithoutSPT;
const convertFromPrismaData = (data) => {
    const { performed_by = [], set_points = [], set_points_table = [], standard_details = [], ...restWithId } = data;
    const result = {
        ...(0, exports.convertToIntMain)(restWithId),
        performed_by: performed_by.map((pb) => changeIdTo_id(pb)),
        set_points: set_points.map((sp) => changeIdTo_id(sp)),
        standard_details: standard_details.map((sd) => convertToIntSD(sd)),
        set_points_table: set_points_table.map((spt) => {
            const { set_points = [], ...sptWithoutSp } = spt;
            return {
                ...changeIdTo_id(sptWithoutSp),
                set_points: set_points.map((sp) => changeIdTo_id(sp)),
            };
        }),
    };
    return result;
};
exports.convertFromPrismaData = convertFromPrismaData;
const removeIDFields = (obj) => {
    // Function to recursively remove _id and id fields
    const removeIds = (obj) => {
        if (Array.isArray(obj)) {
            obj.forEach(item => removeIds(item));
        }
        else if (typeof obj === 'object' && obj !== null) {
            delete obj._id;
            delete obj.id;
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object') {
                    removeIds(obj[key]);
                }
            });
        }
    };
    // Create a deep copy of the input object to avoid mutating the original
    const jsonObject = JSON.parse(JSON.stringify(obj));
    // Remove _id and id fields from the main object
    removeIds(jsonObject);
    return jsonObject;
};
exports.removeIDFields = removeIDFields;
//# sourceMappingURL=utils.js.map