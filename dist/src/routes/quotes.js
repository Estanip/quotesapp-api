"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quotes_1 = require("../controllers/quotes");
const { Router } = require('express');
const router = Router();
router.get('/quotes', quotes_1.getQuotes);
router.get('/average', quotes_1.getAverage);
router.get('/slippage', quotes_1.getSlippage);
module.exports = router;
