const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const responseTime = require('response-time');

const app = express();

// Settings
app.use(responseTime());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/cors', (req:any, res:any) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.send({ "msg": "This has CORS enabled 🎈" })
})
app.use(cors());

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
