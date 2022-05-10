const axios = require('axios');
const puppeteer = require('puppeteer');

const minimal_args = [
    '--no-sandbox'
];


export const getData = async () => {

    try {

        const browser = await puppeteer.launch({
            args: minimal_args
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

            quotesArray = [...quotesArray, {
                "buy_price": buy_price,
                "sell_price": sell_price,
                "source": url,
                "name": 'Ambito'
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

            quotesArray = [...quotesArray, {
                "buy_price": buy_price,
                "sell_price": sell_price,
                "source": url,
                "name": 'Dolar Hoy'
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

            quotesArray = [...quotesArray, {
                "buy_price": buy_price,
                "sell_price": sell_price,
                "source": url,
                "name": 'Cronista'
            }]

        } catch (err) {
            console.log(err)
        }

        return quotesArray;

    } catch (err) {
        console.log(err)
    }
};
