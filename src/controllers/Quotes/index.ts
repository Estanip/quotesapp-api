const puppeteer = require('puppeteer');

export const getQuote = async (req: { query: { source: any; }; }, res: { json: (arg0: { Error: string; }) => any; status: (arg0: number) => { (): any; new(): any; send: { (arg0: { buy_price?: number; sell_price?: number; source?: any; Error?: unknown; }): void; new(): any; }; }; }) => {

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
            return res.json({
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
        res.status(500).send({
            "Error": err
        })
    }
};

export const getAverage = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { Error?: unknown; average_buy_price?: number; average_sell_price?: number; }): void; new(): any; }; }; }) => {

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
            res.status(500).send({
                "Error": err
            })
        }

        try {

            await page.goto('https://www.dolarhoy.com');

            const buyPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.compra div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            const sellPrice = await page.$$eval('.tile.is-parent.is-5 div.values div.venta div.val', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buyPrices.push(parseFloat(buyPrice[0].replace('$', '')))
            sellPrices.push(parseFloat(sellPrice[0].replace('$', '')))

        } catch (err) {
            res.status(500).send({
                "Error": err
            })
        }

        try {

            await page.goto('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB');

            const buyPrice = await page.$$eval('.piece.markets.standard.boxed .buy-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))
            const sellPrice = await page.$$eval('.piece.markets.standard.boxed .sell-value', (elements: any[]) => elements.map((el: { innerText: any; }) => el.innerText))

            buyPrices.push(parseFloat(buyPrice[0].replace('$', '').replace(',', '.')))
            sellPrices.push(parseFloat(sellPrice[0].replace('$', '').replace(',', '.')))

        } catch (err) {
            res.status(500).send({
                "Error": err
            })
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
        res.status(500).send({
            "Error": err
        })
    }
};

export const getSlippage = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { Status?: string; Error?: unknown; }): void; new(): any; }; }; }) => {
    try {

        res.status(200).send({
            "Status": "OK"
        })

    } catch(err) {
        res.status(500).send({
            "Error": err
        })
    }
}
