const puppeteer = require('puppeteer');

const getQuote = async (req, res) => {

    const { source } = req.query;

    try {

        const browser = await puppeteer.launch({ 
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();

        if (source === 'ambito') {
            await page.goto('https://www.ambito.com/contenidos/dolar.html');
        } else {
            return res.json({
                "Error": "Recurso no encontrado"
            })
        }

        const url = await page.url();

        const buyPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements) => elements.map(el => el.innerText))
        const sellPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements) => elements.map(el => el.innerText))

        const buy_price = parseFloat(buyPrice[0].replace(',', '.'))
        const sell_price = parseFloat(sellPrice[0].replace(',', '.'))

        return res.json({
            "buy_price": buy_price,
            "sell_price": sell_price,
            "source": url
        })

    } catch (err) {
        console.log(err)
    }
};

module.exports = { getQuote };