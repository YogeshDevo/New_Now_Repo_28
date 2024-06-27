"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLockInstruments = exports.lock = exports.findOne = void 0;
const lock_instruements_model_1 = require("./lock-instruements.model");
const k = 2;
async function findOne(req, res, next) {
    try {
        const result = await lock_instruements_model_1.lockInstruments.find({
            standard_instrument_id: (req.query.instrument_id),
        }).toArray();
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
async function lock(body, id) {
    try {
        const obj = [];
        const cal_master_id = body.cal_master_id;
        body.standard_details?.forEach((data) => {
            const obj1 = {
                standard_instrument_id: data.instrument_id_no,
                user_id: id,
                cal_master_id: cal_master_id,
            };
            obj.push(obj1);
        });
        const result = await lock_instruements_model_1.lockInstruments.insertMany(obj);
        if (!result.acknowledged) {
            throw new Error('Error inserting lockInstrument.');
        }
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.lock = lock;
async function deleteLockInstruments(body, id) {
    try {
        const cal_master_id = body.cal_master_id;
        body.standard_details?.forEach(async (data) => {
            const obj = {
                standard_instrument_id: data.instrument_id_no,
                user_id: id,
                cal_master_id: cal_master_id,
            };
            await lock_instruements_model_1.lockInstruments.findOneAndDelete(obj);
        });
    }
    catch (error) {
        throw error;
    }
}
exports.deleteLockInstruments = deleteLockInstruments;
//# sourceMappingURL=lock-instruments.handlers.js.map