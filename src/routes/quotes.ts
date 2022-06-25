import { getAverage, getQuotes, getSlippage } from "../controllers/quotes";

const { Router } = require('express');
const router = Router();

router.get('/quotes', getQuotes);  
router.get('/average', getAverage);
router.get('/slippage', getSlippage);

module.exports = router;