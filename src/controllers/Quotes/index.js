const puppeteer = require('puppeteer');

const getQuote = async (req, res) => {

    const { source } = req.query;

    try {

        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();

        let buyPrice;
        let sellPrice;
        let url;

        let buy_price;
        let sell_price;

        if (source === 'ambito') {

            await page.goto('https://www.ambito.com/contenidos/dolar.html');
            url = await page.url();

            buyPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements) => elements.map(el => el.innerText))
            sellPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements) => elements.map(el => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace(',', '.'))
            sell_price = parseFloat(sellPrice[0].replace(',', '.'))

        } else if (source === 'dolarhoy') {

            await page.goto('https://www.dolarhoy.com');
            url = await page.url();

            buyPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements) => elements.map(el => el.innerText))
            sellPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements) => elements.map(el => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace('$', ''))
            sell_price = parseFloat(sellPrice[0].replace('$', ''))

        } else if (source === 'cronista') {

            await page.goto('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB');
            url = await page.url();

            buyPrice = await page.$$eval('.piece.markets.standard.boxed .buy-value', (elements) => elements.map(el => el.innerText))
            sellPrice = await page.$$eval('.piece.markets.standard.boxed .sell-value', (elements) => elements.map(el => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace('$', '').replace(',', '.'))
            sell_price = parseFloat(sellPrice[0].replace('$', '').replace(',', '.'))

        } else {
            return res.json({
                "Error": "Recurso no encontrado"
            })
        }

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