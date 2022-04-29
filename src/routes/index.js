const { Router } = require('express');

const router = Router();

const quotesRoutes = require('./quotes');

router.use('/api/quotes', quotesRoutes);

module.exports = router;