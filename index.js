const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const router = require('./src/routes/index');


// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// Routes
app.use(router);

// Run server
const port = process.env.PORT || 3008;
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
