"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seed_1 = require("./seed");
const router = (0, express_1.Router)();
router.post('/', seed_1.seed);
router.post('/seed-block', seed_1.seedBlock);
router.post('/seed-user', seed_1.seedUser);
exports.default = router;
//# sourceMappingURL=seed.routes.js.map