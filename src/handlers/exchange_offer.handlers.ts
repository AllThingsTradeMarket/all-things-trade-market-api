import { Request, Response } from 'express-serve-static-core';
import { ExchangeOfferSearchParams, ExchangeOfferUpdateRequest } from '../types/exchange_offers.types';
import { CreateExchangeOfferDto, UpdateExchangeOfferDto } from '../dtos/exchange_offer.dtos';
import { ExchangeOffer } from '../models/exchange_offer.model';
import { exchangeOffersDb } from '../models/exchange_offer.model';
import { findExchangeOffersByParams, assignOfferedProductsData, assignRequestedProductsData } from '../utils/helpers/exchangeOfferHelpers/exchange_offer.helpers';
import { queues_names } from '../utils/constants/queues_names';
import { socketEvents } from '../utils/constants/socket_events';
import { createRequestChannel } from '../utils/helpers/create_request_channel';

export const createExchangeOffer = async (request: Request<{}, {}, CreateExchangeOfferDto>, response: Response) => {
    try {
        const exchangeOfferRequest = request.body;
        createRequestChannel<CreateExchangeOfferDto>(exchangeOfferRequest, queues_names.EXCHANGE_OFFER_QUEUE, 
            socketEvents.NEW_EXCHANGE_OFFER, response);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};

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

export const updateExchangeOffer = async (request: Request<{id: number}, {}, UpdateExchangeOfferDto>, response: Response) => {
    try {
        const exchangeOfferId = request.params.id;
        const { status } = request.body;
        const requestData: ExchangeOfferUpdateRequest = {
            id: exchangeOfferId,
            status: status
        };
    
        createRequestChannel<ExchangeOfferUpdateRequest>(requestData, queues_names.EXCHANGE_OFFER_UPDATE_QUEUE, socketEvents.EXCHANGE_OFFER_UPDATE, response);
    } catch (error) {
        console.error('Error updating exchange offer:', error);
        return response.status(500).json({ message: 'An error occurred while updating the exchange offer' });
    }
};

