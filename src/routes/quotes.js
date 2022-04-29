const { Router } = require('express');
const router = Router();

const { get } = require('../controllers/Quotes/index');

router.get('/', get);  

module.exports = router;