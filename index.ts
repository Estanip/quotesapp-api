const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

const app = express();

// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req: any, res: any, next: any) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE, PATCH"
    );
    next();
});
app.get('/cors', (req:any, res:any) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.send({ "msg": "This has CORS enabled 🎈" })
})
app.use(cors({ origin: "*" }));


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
