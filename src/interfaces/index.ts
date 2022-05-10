export interface Average {
    average_buy_price: number;
    average_sell_price: number;
};

export interface Slippage {
    buy_price_slippage: number;
    sell_price_slippage: number;
    source: string;
    name: string;
};

export interface Quote {
    buy_price: number,
    sell_price: number,
    source: string;
};