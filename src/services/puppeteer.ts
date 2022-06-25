import { getCache, setCache } from "../helpers/redis";

const { addExtra } = require('puppeteer-extra');
const puppeteerVanilla = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { Cluster } = require('puppeteer-cluster');

const puppeteer = addExtra(puppeteerVanilla)
puppeteer.use(StealthPlugin())

export const getData = async () => {

    try {
        const cache = await getCache('quotes');
        if (cache) return cache;

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 2,
            puppeteerOptions: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }

        });

        let quotesArray: any = [];

        let buyPrice;
        let sellPrice;
        let urlPage;

        let buy_price;
        let sell_price;

        let dolarQuote: any = {};
        let cronistaQuote: any = {};
        let ambitoQuote: any = {};

        await cluster.task(async ({ page, data: url }: any) => {
            await page.goto(url);
            urlPage = await page.url();

            if (urlPage.includes('ambito') === true) {

                buyPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
                sellPrice = await page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

                buy_price = buyPrice ? parseFloat(buyPrice[0].replace(',', '.')) : 0;
                sell_price = sellPrice ? parseFloat(sellPrice[0].replace(',', '.')) : 0;

                ambitoQuote = {
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "source": urlPage,
                    "name": 'Ambito'
                }
            }


            if (urlPage.includes('dolarhoy') === true) {


                buyPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
                sellPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

                buy_price = parseFloat(buyPrice[0].replace('$', ''))
                sell_price = parseFloat(sellPrice[0].replace('$', ''))

                dolarQuote = {
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "source": urlPage,
                    "name": 'Dolar Hoy'
                }
            }

            if (urlPage.includes('cronista') === true) {

                buyPrice = await page.$$eval('.piece.markets.standard.boxed .buy-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
                sellPrice = await page.$$eval('.piece.markets.standard.boxed .sell-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

                buy_price = buyPrice ? parseFloat(buyPrice[0].replace('$', '').replace(',', '.')) : 0;
                sell_price = sellPrice ? parseFloat(sellPrice[0].replace('$', '').replace(',', '.')) : 0;

                cronistaQuote = {
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "source": url,
                    "name": 'Cronista'
                }

            }

            quotesArray = [dolarQuote ? dolarQuote : {}, cronistaQuote ? cronistaQuote : {}, ambitoQuote ? ambitoQuote : {}]

        });

        cluster.queue('https://www.dolarhoy.com');
        cluster.queue('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB')
        cluster.queue('https://www.ambito.com/contenidos/dolar.html')

        await cluster.idle();
        await cluster.close();

        await setCache('quotes', quotesArray);

        return quotesArray

    } catch (error) {
        console.log(error)
    }

}

