import { Request, Response } from 'express-serve-static-core';
import { ExchangeOfferSearchParams } from '../types/exchange_offers.types';
import { CreateExchangeOfferDto } from '../dtos/exchange_offer.dtos';
import { ExchangeOffer } from '../models/exchange_offer.model';
import { exchangeOffersDb } from '../models/exchange_offer.model';
import { isEmpty } from 'lodash';
import { createExchangeOfferOfferedProducts, createExchangeOfferRequestedProducts, findExchangeOffersByParams, assignOfferedProductsData, assignRequestedProductsData } from '../utils/helpers/exchangeOfferHelpers/exchange_offer.helpers';
import { formatDateToDDMMYYYY } from '../utils/helpers/helpers';
import { exchangeStatusses } from '../utils/constants/exchange_statusses';

export const getExchangeOffers = async (request: Request<{}, {}, {}, ExchangeOfferSearchParams>, response: Response<ExchangeOffer[] | Error>) => {
    const params = request.query;
    try {
        const exchangeOffers = await findExchangeOffersByParams(params);
        await assignRequestedProductsData(exchangeOffers);
        await assignOfferedProductsData(exchangeOffers);

        response.status(200).json(exchangeOffers);
    } catch(error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            response.send(error);
        }
    }
};

export const createExchangeOffer = async (request: Request<{}, {}, CreateExchangeOfferDto>, response: Response) => {
    try {
        const exchangeOfferRequest = request.body;
        console.log('request.body:');
        console.log(exchangeOfferRequest)
        const [exchangeOfferId] = await exchangeOffersDb().insert(
            {
                receiverId: exchangeOfferRequest.receiverId,
                senderId: exchangeOfferRequest.senderId,
                date: formatDateToDDMMYYYY(new Date()),
                status: exchangeStatusses.PENDING,
                offeredCash: exchangeOfferRequest.offeredCash
            }
        );
        console.log(`created with id: ${exchangeOfferId}`);;
        if (!exchangeOfferId) {
            throw Error('Could not create the exchange offer');
        }
        if (!isEmpty(exchangeOfferRequest.offeredProductsIds)) {
            await createExchangeOfferOfferedProducts(exchangeOfferId.toString(), exchangeOfferRequest.offeredProductsIds!);
        }
        await createExchangeOfferRequestedProducts(exchangeOfferId.toString(), exchangeOfferRequest.requestedProductsIds);
        
        console.log('Succesfully created exchange offer! With proper assignments')
        response.status(201).json({
            id: exchangeOfferId
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};
