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
exports.getSlippage = exports.getAverage = exports.getQuotes = void 0;
const redis_1 = require("../helpers/redis");
const puppeteer_1 = require("../services/puppeteer");
require('dotenv').config();
const getQuotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quotesArray = yield (0, puppeteer_1.getData)();
        if (quotesArray.length > 0) {
            return res.status(200).send(quotesArray);
        }
        else {
            return res.send({
                success: false,
                message: "No se puedo obtener cotizaciones"
            });
        }
    }
    catch (err) {
        res.send({
            Error: err
        });
    }
});
exports.getQuotes = getQuotes;
const getAverage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let quotes;
        quotes = yield (0, redis_1.getCache)('quotes');
        if (quotes === null) {
            quotes = yield (0, puppeteer_1.getData)();
        }
        const buyPrices = quotes.map((e) => {
            return e.buy_price;
        });
        const sellPrices = quotes.map((e) => {
            return e.sell_price;
        });
        const setAverage = (array) => {
            let sum = array.reduce((prev, curr) => prev + curr, 0);
            return +(sum / array.length).toFixed(2);
        };
        const averageBuyPrice = setAverage(buyPrices);
        const averageSellPrice = setAverage(sellPrices);
        yield (0, redis_1.setCache)('average', {
            "average_buy_price": averageBuyPrice,
            "average_sell_price": averageSellPrice
        });
        return res.status(200).send({
            "average_buy_price": averageBuyPrice,
            "average_sell_price": averageSellPrice
        });
    }
    catch (err) {
        res.send({
            Error: err
        });
    }
});
exports.getAverage = getAverage;
const getSlippage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let averageBuyPrice;
        let averageSellPrice;
        let quotes;
        quotes = yield (0, redis_1.getCache)('quotes');
        if (quotes === null) {
            return res.status(404).send({
                message: "No se han encontrado cotizaciones"
            });
        }
        let average = yield (0, redis_1.getCache)('average');
        averageBuyPrice = average.average_buy_price;
        averageSellPrice = average.average_sell_price;
        const getSlippagePercentage = (ave, quote) => {
            const result = quote - ave;
            return +((result / ave) * 100).toFixed(2);
        };
        const slippageArray = quotes.map((e) => {
            return {
                "buy_price_slippage": getSlippagePercentage(averageBuyPrice, e.buy_price),
                "sell_price_slippage": getSlippagePercentage(averageSellPrice, e.sell_price),
                "source": e.source,
                "name": e.name
            };
        });
        yield (0, redis_1.setCache)('slippage', slippageArray);
        return res.status(200).send(slippageArray);
    }
    catch (err) {
        res.send({
            Error: err
        });
    }
});
exports.getSlippage = getSlippage;
