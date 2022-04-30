import { getQuote, getAverage, getSlippage } from "../controllers/Quotes";

const { Router } = require('express');
const router = Router();

router.get('/quotes', getQuote);  
router.get('/average', getAverage);
router.get('/slippage', getSlippage);

module.exports = router;