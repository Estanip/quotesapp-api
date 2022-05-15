const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const responseTime = require('response-time');
require('dotenv').config()

const app = express();

// Settings
app.use(responseTime());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api', require(path.join(__dirname, '/src/routes/quotes')));

// Run server
const port = process.env.PORT || 3000;
const main = async () => {
    try {
        await app.listen(port, () => {
            console.log(`Servidor escuchando en puerto ${port}`)
        })
    } catch {
        console.log("Error de Servidor")
    }
}

main();
