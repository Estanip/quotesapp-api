const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

const app = express();

console.log("DIRNAME",__dirname)


// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// Routes
app.use('/api', require(path.join(__dirname, '/src/routes/quotes')));

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