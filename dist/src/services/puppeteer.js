"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const redis_1 = require("../helpers/redis");
const { addExtra } = require('puppeteer-extra');
const puppeteerVanilla = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Cluster } = require('puppeteer-cluster');
const puppeteer = addExtra(puppeteerVanilla);
puppeteer.use(StealthPlugin());
const getData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cache = yield (0, redis_1.getCache)('quotes');
        if (cache)
            return cache;
        const cluster = yield Cluster.launch({
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
        let quotesArray = [];
        let buyPrice;
        let sellPrice;
        let urlPage;
        let buy_price;
        let sell_price;
        let dolarQuote = {};
        let cronistaQuote = {};
        let ambitoQuote = {};
        yield cluster.task(({ page, data: url }) => __awaiter(void 0, void 0, void 0, function* () {
            yield page.goto(url);
            urlPage = yield page.url();
            if (urlPage.includes('ambito') === true) {
                buyPrice = yield page.$$eval('[data-indice*="/dolar/informal"] span.value.data-compra', (elements) => elements.map((el) => el.innerText));
                sellPrice = yield page.$$eval('[data-indice*="/dolar/informal"] span.value.data-venta', (elements) => elements.map((el) => el.innerText));
                buy_price = buyPrice ? parseFloat(buyPrice[0].replace(',', '.')) : 0;
                sell_price = sellPrice ? parseFloat(sellPrice[0].replace(',', '.')) : 0;
                ambitoQuote = {
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "source": urlPage,
                    "name": 'Ambito'
                };
            }
            if (urlPage.includes('dolarhoy') === true) {
                buyPrice = yield page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements) => elements.map((el) => el.innerText));
                sellPrice = yield page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements) => elements.map((el) => el.innerText));
                buy_price = parseFloat(buyPrice[0].replace('$', ''));
                sell_price = parseFloat(sellPrice[0].replace('$', ''));
                dolarQuote = {
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "source": urlPage,
                    "name": 'Dolar Hoy'
                };
            }
            if (urlPage.includes('cronista') === true) {
                buyPrice = yield page.$$eval('.piece.markets.standard.boxed .buy-value', (elements) => elements.map((el) => el.innerText));
                sellPrice = yield page.$$eval('.piece.markets.standard.boxed .sell-value', (elements) => elements.map((el) => el.innerText));
                buy_price = buyPrice ? parseFloat(buyPrice[0].replace('$', '').replace(',', '.')) : 0;
                sell_price = sellPrice ? parseFloat(sellPrice[0].replace('$', '').replace(',', '.')) : 0;
                cronistaQuote = {
                    "buy_price": buy_price,
                    "sell_price": sell_price,
                    "source": url,
                    "name": 'Cronista'
                };
            }
            quotesArray = [dolarQuote ? dolarQuote : {}, cronistaQuote ? cronistaQuote : {}, ambitoQuote ? ambitoQuote : {}];
        }));
        cluster.queue('https://www.dolarhoy.com');
        cluster.queue('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB');
        cluster.queue('https://www.ambito.com/contenidos/dolar.html');
        yield cluster.idle();
        yield cluster.close();
        yield (0, redis_1.setCache)('quotes', quotesArray);
        return quotesArray;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getData = getData;
