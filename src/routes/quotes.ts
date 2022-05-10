import { getQuotes, getAverage, getSlippage } from "../controllers/Quotes";
import { cache } from '../helpers/cache';

const { Router } = require('express');
const router = Router();

router.get('/quotes', cache(60), getQuotes);  
router.get('/average',cache(60), getAverage);
router.get('/slippage', cache(60), getSlippage);

module.exports = router;