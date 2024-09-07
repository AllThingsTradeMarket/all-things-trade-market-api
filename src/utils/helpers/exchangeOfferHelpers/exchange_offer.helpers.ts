import { ExchangeOffer, exchangeOffersDb } from "../../../models/exchange_offer.model";
import { exchangeOfferedProductsDb } from "../../../models/exchange_offered_products.model";
import { exchangeRequestedProductsDb } from "../../../models/exchange_requested_products.model";
import { Offer, offersDb } from "../../../models/offer.model";
import { ExchangeOfferSearchParams } from "../../../types/exchange_offers.types";

export const createExchangeOfferRequestedProducts = async (exchangeId: string, requestedProductsIds: string[]) => {
    for (let productId of requestedProductsIds) {
        await exchangeRequestedProductsDb().insert({
            exchangeOfferId: exchangeId,
            offerId: productId
        });
    }
};

export const createExchangeOfferOfferedProducts = async (exchangeId: string, offeredProductsIds: string[]) => {
    for (let productId of offeredProductsIds) {
        await exchangeOfferedProductsDb().insert({
            exchangeOfferId: exchangeId,
            offerId: productId
        });
    }
};

export const findExchangeOffersByParams = async (params: ExchangeOfferSearchParams): Promise<ExchangeOffer[]> => {
    return exchangeOffersDb()
        .modify(queryBuilder => {
            if (params.id) {
                queryBuilder.andWhere('id', params.id);
            }
            if (params.receiverId) {
                queryBuilder.andWhere('receiverId', params.receiverId);
            }
            if (params.senderId) {
                queryBuilder.andWhere('senderId', params.senderId);
            }
            if (params.status) {
                queryBuilder.andWhere('status', params.status);
            }
        });
};

export const assignOfferedProductsData = async (exchangeOffers: ExchangeOffer[]) => {
    let offeredProducts: Offer[] = [];
    for (let exchangeOffer of exchangeOffers) {
        const offeredProductsIds = await exchangeOfferedProductsDb()
            .where('exchangeOfferId', exchangeOffer.id)
            .pluck('offerId');
        
        offeredProducts = await offersDb().whereIn('id', offeredProductsIds);
        exchangeOffer.offeredProducts = offeredProducts ? offeredProducts : [];
    }
}

export const assignRequestedProductsData = async (exchangeOffers: ExchangeOffer[]) => {
    let requestedProducts: Offer[] = [];
    for (let exchangeOffer of exchangeOffers) {
        const requestedProductsIds = await exchangeRequestedProductsDb()
            .where('exchangeOfferId', exchangeOffer.id)
            .pluck('offerId');

        requestedProducts = await offersDb().whereIn('id', requestedProductsIds);
        exchangeOffer.requestedProducts = requestedProducts ? requestedProducts : [];
    }
}