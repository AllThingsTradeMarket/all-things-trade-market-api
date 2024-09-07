import { exchangeStatusses } from "../utils/constants/exchange_statusses";

export type ExchangeOfferStatus = typeof exchangeStatusses[keyof typeof exchangeStatusses];

export type ExchangeOfferSearchParams = {
    receiverId?: string;
    senderId?: string;
    id?: string;
    status?: ExchangeOfferStatus;
}
