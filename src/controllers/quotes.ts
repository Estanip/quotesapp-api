import { getCache, setCache } from '../helpers/redis';
import { getData } from '../services/puppeteer';
import { Quote, Average } from '../interfaces/index';

require('dotenv').config();

export const getQuotes = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { success: boolean; quotesArray: Array<Quote>; }): any; new(): any; }; }; send: (arg0: { success?: boolean; message?: string; Error?: unknown; }) => void; }) => {

    try {

        const quotesArray = await getData();

        if (quotesArray.length > 0) {

            return res.status(200).send(quotesArray);

        } else {
            return res.send({
                success: false,
                message: "No se puedo obtener cotizaciones"
            });
        }

    } catch (err) {
        res.send({
            Error: err
        })
    }
};

export const getAverage = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: Average): any; new(): any; }; }; send: (arg0: { Error: unknown; }) => void; }) => {

    try {

        let quotes;

        quotes = await getCache('quotes');

        if (quotes === null) {
            quotes = await getData()
        }

        const buyPrices = quotes.map((e: any) => {
            return e.buy_price;
        })

        const sellPrices = quotes.map((e: any) => {
            return e.sell_price;
        })

        const setAverage = (array: any[]) => {
            let sum = array.reduce((prev: any, curr: any) => prev + curr, 0)
            return +(sum / array.length).toFixed(2);
        }

        const averageBuyPrice = setAverage(buyPrices)
        const averageSellPrice = setAverage(sellPrices)

        await setCache('average', {
            "average_buy_price": averageBuyPrice,
            "average_sell_price": averageSellPrice
        });

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

export const getSlippage = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { message: string; }): any; new(): any; }; }; send: (arg0: { Error: unknown; }) => void; }) => {
    try {

        let averageBuyPrice: number;
        let averageSellPrice: number;

        let quotes;

        quotes = await getCache('quotes');

        if (quotes === null) {
            return res.status(404).send({
                message: "No se han encontrado cotizaciones"
            })
        }

        let average = await getCache('average');

        averageBuyPrice = average.average_buy_price;
        averageSellPrice = average.average_sell_price;

        const getSlippagePercentage = (ave: number, quote: number) => {
            const result = quote - ave;
            return +((result / ave) * 100).toFixed(2);
        }

        const slippageArray = quotes.map((e: any) => {
            return {
                "buy_price_slippage": getSlippagePercentage(averageBuyPrice, e.buy_price),
                "sell_price_slippage": getSlippagePercentage(averageSellPrice, e.sell_price),
                "source": e.source,
                "name": e.name
            }
        })

        await setCache('slippage', slippageArray);

        return res.status(200).send(slippageArray)

    } catch (err) {
        res.send({
            Error: err
        })
    }
};