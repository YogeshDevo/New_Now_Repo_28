"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFromPrismaData = exports.convertToPrismaData = void 0;
const convertToPrismaData = (data) => {
    const result = data;
    return result;
};
exports.convertToPrismaData = convertToPrismaData;
const convertFromPrismaData = (data) => {
    const result = {
        // TODO
        _id: data.id,
        pdf_data: data.pdf_data ?? undefined,
        pdf_title: data.pdf_title ?? undefined,
        procedure_no: data.procedure_no,
        vendor_name: data.vendor_name,
        version_no: data.version_no,
        title: data.title ?? undefined,
        updated_at: Number(data.updated_at),
    };
    return result;
};
exports.convertFromPrismaData = convertFromPrismaData;
//# sourceMappingURL=utils.js.map