const { Router } = require('express');
const router = Router();

const { getQuote } = require('../controllers/Quotes/index');

router.get('/', getQuote);  

module.exports = router;