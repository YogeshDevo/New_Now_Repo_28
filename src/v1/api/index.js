"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inc_cal_routes_1 = __importDefault(require("./instrument_calibration/inc-cal.routes"));
const ins_master_routes_1 = __importDefault(require("./instrument_master/ins-master.routes"));
const cal_reports_routes_1 = __importDefault(require("./calibration-reports/cal-reports.routes"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
const inc_procedure_routes_1 = __importDefault(require("./calibration-procedure/inc-procedure.routes"));
const set_ponts_routes_1 = __importDefault(require("./set-points/set-ponts.routes"));
const external_report_routes_1 = __importDefault(require("./external-report/external-report.routes"));
const lock_instruments_1 = __importDefault(require("./lock-instruments/lock-instruments"));
const cfr_routes_1 = __importDefault(require("./cfr/cfr.routes"));
const db_backup_routes_1 = __importDefault(require("./db-backup/db-backup.routes"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const cal_schedule_routes_1 = __importDefault(require("./calibration-schedule/cal-schedule.routes"));
const std_cal_schedule_routes_1 = __importDefault(require("./std-calibration-schedule/std-cal-schedule.routes"));
const ins_request_routes_1 = __importDefault(require("./instrument_request/ins-request.routes"));
const api_status_routes_1 = __importDefault(require("./api-status/api-status.routes"));
const units_routes_1 = __importDefault(require("./units/units.routes"));
const tolerance_routes_1 = __importDefault(require("./tolerance/tolerance.routes"));
const inc_dep_routes_1 = __importDefault(require("./instrument_department/inc-dep.routes"));
const contact_routes_1 = __importDefault(require("./contact-admin/contact.routes"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌎🌍🌏',
    });
});
router.use('/inc-cal', inc_cal_routes_1.default);
router.use('/ins-master', ins_master_routes_1.default);
router.use('/report', cal_reports_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/cal-procedure', inc_procedure_routes_1.default);
router.use('/set-points', set_ponts_routes_1.default);
router.use('/external-report', external_report_routes_1.default);
router.use('/cfr', cfr_routes_1.default);
router.use('/db-backup', db_backup_routes_1.default);
router.use('/auth', auth_routes_1.default);
router.use('/cal-schedule', cal_schedule_routes_1.default);
router.use('/std-cal-schedule', std_cal_schedule_routes_1.default);
router.use('/ins-request', ins_request_routes_1.default);
router.use('/api-status', api_status_routes_1.default);
router.use('/units', units_routes_1.default);
router.use('/mutex', lock_instruments_1.default);
router.use('/tolerances', tolerance_routes_1.default);
router.use('/ins-dept', inc_dep_routes_1.default);
router.use('/contactadmin', contact_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map