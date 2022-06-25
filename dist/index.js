"use strict";
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3008;
// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Routes
app.use('/api', require(path.join(__dirname, '/src/routes/quotes')));
// Run server
app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
});
// Export the Express API
module.exports = app;
