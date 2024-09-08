import { ExchangeOfferStatus } from "../types/exchange_offers.types";

export type CreateExchangeOfferDto = {
    senderId: string;
    receiverId: string;
    offeredCash?: number;
    offeredProductsIds?: string[];
    requestedProductsIds: string[];
};

export type UpdateExchangeOfferDto = {
    status: ExchangeOfferStatus
};