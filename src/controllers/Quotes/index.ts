const axios = require('axios');
const puppeteer = require('puppeteer');

require('dotenv').config();

export const getQuote = async (req: { query: { source: any; }; }, res: any) => {

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

            buyPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            sellPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace(',', '.'))
            sell_price = parseFloat(sellPrice[0].replace(',', '.'))

        } else if (source === 'dolarhoy') {

            await page.goto('https://www.dolarhoy.com');
            url = await page.url();

            buyPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            sellPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace('$', ''))
            sell_price = parseFloat(sellPrice[0].replace('$', ''))

        } else if (source === 'cronista') {

            await page.goto('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB');
            url = await page.url();

            buyPrice = await page.$$eval('.piece.markets.standard.boxed .buy-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            sellPrice = await page.$$eval('.piece.markets.standard.boxed .sell-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace('$', '').replace(',', '.'))
            sell_price = parseFloat(sellPrice[0].replace('$', '').replace(',', '.'))

        } else {
            return res.send({
                "Error": "Recurso no encontrado"
            })
        }

        await browser.close();

        return res.status(200).send({
            "buy_price": buy_price,
            "sell_price": sell_price,
            "source": url
        })

    } catch (err) {
        res.send({
            Error: err
        })
    }
};

export const getAverage = async (req: any, res: any) => {

    try {

        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();

        const buyPrices = [];
        const sellPrices = [];

        try {

            await page.goto('https://www.ambito.com/contenidos/dolar.html');

            const buyPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            const sellPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buyPrices.push(parseFloat(buyPrice[0].replace(',', '.')))
            sellPrices.push(parseFloat(sellPrice[0].replace(',', '.')))

        } catch (err) {
            console.log(err)
        }

        try {

            await page.goto('https://www.dolarhoy.com');

            const buyPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            const sellPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buyPrices.push(parseFloat(buyPrice[0].replace('$', '')))
            sellPrices.push(parseFloat(sellPrice[0].replace('$', '')))

        } catch (err) {
            console.log(err)
        }

        try {

            await page.goto('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB');

            const buyPrice = await page.$$eval('.piece.markets.standard.boxed .buy-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            const sellPrice = await page.$$eval('.piece.markets.standard.boxed .sell-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buyPrices.push(parseFloat(buyPrice[0].replace('$', '').replace(',', '.')))
            sellPrices.push(parseFloat(sellPrice[0].replace('$', '').replace(',', '.')))

        } catch (err) {
            console.log(err)
        }

        await browser.close();

        const getAverage = (array: any[]) => {
            let sum = array.reduce((prev: any, curr: any) => prev + curr, 0)
            return +(sum / array.length).toFixed(2);
        }

        const averageBuyPrice = getAverage(buyPrices)
        const averageSellPrice = getAverage(sellPrices)

        return res.status(200).send({
            "average_buy_price": averageBuyPrice,
            "average_sell_price": averageSellPrice
        })

    } catch (err) {
        res.send({
            Error: err
        })
    }
};

export const getSlippage = async (req: any, res: any) => {
    try {

        let averageBuyPrice: number;
        let averageSellPrice: number;

        let ambitoQuote;
        let cronistaQuote;
        let dolarhoyQuote;

        const quotesArray = [];

        try {

            const { data } = await axios.get(`${process.env.API_PROD}/average`);
            averageBuyPrice = data.average_buy_price;
            averageSellPrice = data.average_sell_price;

        } catch (err) {
            console.log(err)
        }

        try {

            const { data } = await axios.get(`${process.env.API_PROD}/quotes?source=ambito`);
            ambitoQuote = data;
            quotesArray.push(ambitoQuote)

        } catch (err) {
            console.log(err)
        }

        try {

            const { data } = await axios.get(`${process.env.API_PROD}/quotes?source=cronista`);
            cronistaQuote = data;
            quotesArray.push(cronistaQuote)

        } catch (err) {
            console.log(err)
        };

        try {

            const { data } = await axios.get(`${process.env.API_PROD}/quotes?source=dolarhoy`);
            dolarhoyQuote = data;
            quotesArray.push(dolarhoyQuote)

        } catch (err) {
            console.log(err)
        }

        const getSlippagePercentage = (ave: number, quote: number) => {
            const result = quote - ave;
            return +((result / quote) * 100).toFixed(2);
        }

        const slippageArray = quotesArray.map(e => {
            return {
                "buy_price_slippage": getSlippagePercentage(averageBuyPrice, e.buy_price),
                "sell_price_slippage": getSlippagePercentage(averageSellPrice, e.sell_price),
                "source": e.source
            }
        })

        return res.status(200).send(slippageArray)

    } catch (err) {
        res.send({
            Error: err
        })
    }
};
