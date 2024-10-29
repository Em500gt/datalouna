export interface Item {
    market_hash_name: string;
    min_price: number;
}

export interface ItemWithPrices {
    market_hash_name: string;
    min_price_tradable: number;
    min_price_non_tradable: number | null;
}

export interface GetItemsResponse {
    message: string;
    data?: ItemWithPrices[];
}