const axios = require('axios');
const puppeteer = require('puppeteer');

require('dotenv').config();

export const getQuotes = async (req: any, res: any) => {

    try {

        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);

        let quotesArray: any = [];

        let buyPrice;
        let sellPrice;
        let url;

        let buy_price;
        let sell_price;

        try {

            await page.goto('https://www.ambito.com/contenidos/dolar.html');
            url = await page.url();

            buyPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            sellPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace(',', '.'))
            sell_price = parseFloat(sellPrice[0].replace(',', '.'))

            let checkStartUrl = url.includes('www.');
            let urlStart = checkStartUrl ? url.indexOf('.') + 1 : url.indexOf('/') + 1;

            let splitUrl = url.slice(urlStart, url.lastIndexOf('.com'))
            if (splitUrl.includes('/'))
                splitUrl = splitUrl.replace('/', '')
            splitUrl = splitUrl.charAt(0).toUpperCase() + splitUrl.slice(1);

            quotesArray = [...quotesArray, {
                "buy_price": buy_price,
                "sell_price": sell_price,
                "source": url,
                "name": splitUrl
            }]

        } catch (err) {
            console.log(err)
        }

        try {

            await page.goto('https://www.dolarhoy.com');
            url = await page.url();

            buyPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            sellPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace('$', ''))
            sell_price = parseFloat(sellPrice[0].replace('$', ''))

            let checkStartUrl = url.includes('www.');
            let urlStart = checkStartUrl ? url.indexOf('.') + 1 : url.indexOf('/') + 1;

            let splitUrl = url.slice(urlStart, url.lastIndexOf('.com'))
            if (splitUrl.includes('/'))
                splitUrl = splitUrl.replace('/', '')
            splitUrl = splitUrl.charAt(0).toUpperCase() + splitUrl.slice(1);

            quotesArray = [...quotesArray, {
                "buy_price": buy_price,
                "sell_price": sell_price,
                "source": url,
                "name": splitUrl
            }]

        } catch (err) {
            console.log(err)
        }

        try {

            await page.goto('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB');
            url = await page.url();

            buyPrice = await page.$$eval('.piece.markets.standard.boxed .buy-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            sellPrice = await page.$$eval('.piece.markets.standard.boxed .sell-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buy_price = parseFloat(buyPrice[0].replace('$', '').replace(',', '.'))
            sell_price = parseFloat(sellPrice[0].replace('$', '').replace(',', '.'))

            let checkStartUrl = url.includes('www.');
            let urlStart = checkStartUrl ? url.indexOf('.') + 1 : url.indexOf('/') + 1;

            let splitUrl = url.slice(urlStart, url.lastIndexOf('.com'))
            if (splitUrl.includes('/'))
                splitUrl = splitUrl.replace('/', '')
            splitUrl = splitUrl.charAt(0).toUpperCase() + splitUrl.slice(1);

            quotesArray = [...quotesArray, {
                "buy_price": buy_price,
                "sell_price": sell_price,
                "source": url,
                "name": splitUrl
            }]

        } catch (err) {
            console.log(err)
        }

        await page.close();
        await browser.close();

        return res.status(200).send(quotesArray);

    } catch (err) {
        res.send({
            Error: err
        })
    }
};

export const getAverage = async (req: any, res: any) => {

    try {

        let quotes;

        try {

            const { data } = await axios.get(`${process.env.API_DEV}/quotes`);
            quotes = data;

        } catch (err) {
            console.log(err)
        }

        const buyPrices = quotes.map((e: any) => {
            return e.buy_price;
        })

        const sellPrices = quotes.map((e: any) => {
            return e.sell_price;
        })

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

        let quotes;

        try {

            const { data } = await axios.get(`${process.env.API_DEV}/average`);
            averageBuyPrice = data.average_buy_price;
            averageSellPrice = data.average_sell_price;

        } catch (err) {
            console.log(err)
        }

        try {

            const { data } = await axios.get(`${process.env.API_DEV}/quotes`);
            quotes = data;

        } catch (err) {
            console.log(err)
        }

        const getSlippagePercentage = (ave: number, quote: number) => {
            const result = quote - ave;
            return +((result / quote) * 100).toFixed(2);
        }

        const slippageArray = quotes.map((e: any) => {
            return {
                "buy_price_slippage": getSlippagePercentage(averageBuyPrice, e.buy_price),
                "sell_price_slippage": getSlippagePercentage(averageSellPrice, e.sell_price),
                "source": e.source,
                "name": e.name
            }
        })

        return res.status(200).send(slippageArray)

    } catch (err) {
        res.send({
            Error: err
        })
    }
};
