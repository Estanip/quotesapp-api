import { getCache, setCache } from '../../helpers/redis';
import { getData } from '../../services/quotes';

require('dotenv').config();


export const getQuotes = async (req: any, res: any) => {

    try {

        const quotesArray = await getData();

        if (quotesArray.length > 0) {

            return res.status(200).send({
                success: true,
                quotesArray
            });

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

export const getAverage = async (req: any, res: any) => {

    try {

        let quotes;

        quotes = await getCache('quotes');

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

export const getSlippage = async (req: any, res: any) => {
    try {

        let averageBuyPrice: number;
        let averageSellPrice: number;

        let quotes;

        try {

            quotes = await getCache('quotes');

        } catch (err) {
            console.log(err)
        }

        try {

            const average = await getCache('average');

            averageBuyPrice = average.average_buy_price;
            averageSellPrice = average.average_sell_price;

        } catch (err) {
            console.log(err)
        }

        const getSlippagePercentage = (ave: number, quote: number) => {
            const result = ave - quote;
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

        await setCache('slippage', slippageArray);


        return res.status(200).send(slippageArray)

    } catch (err) {
        res.send({
            Error: err
        })
    }
};