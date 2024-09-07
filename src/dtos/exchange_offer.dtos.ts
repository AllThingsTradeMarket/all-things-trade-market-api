export type CreateExchangeOfferDto = {
    senderId: string;
    receiverId: string;
    offeredCash?: number;
    offeredProductsIds?: string[];
    requestedProductsIds: string[];
}