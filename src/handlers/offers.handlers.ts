import { Request, Response } from 'express-serve-static-core';
import { Offer, offersDb } from '../models/offer.model';
import { CreateOfferDto } from '../dtos/offer.dtos';
import { isEmpty } from 'lodash';
import { IMAGES_BASE_PATH } from '../utils/constants/constants';
import { addImagesToOffers, findOfferByParams, getOfferWithoutFiles } from '../utils/helpers/offerHelpers/offer.helpers';
import { OfferCreateRequest, OfferSearchParams } from '../types/offers.types';
import { queues_names } from '../utils/constants/queues_names';
import { socketEvents } from '../utils/constants/socket_events';
import { createRequestChannel } from '../utils/helpers/create_request_channel';

export const createOffer = async (request: Request<{}, {}, CreateOfferDto>, response: Response) => {
    try {
        const uploadedFiles = request.files as Express.Multer.File[];
        let imagePaths: string[] = [];
        const offerRequest = getOfferWithoutFiles(request.body);
        if (!isEmpty(uploadedFiles)) {
            imagePaths = uploadedFiles.map(file => `${IMAGES_BASE_PATH}/${file.filename}`);
        }

        const requestData: OfferCreateRequest = {
            imagePaths: imagePaths,
            offer: offerRequest
        }

        createRequestChannel<OfferCreateRequest>(requestData, queues_names.OFFER_QUEUE, socketEvents.NEW_OFFER, response);
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};

export const getOffers = async (request: Request<{}, {}, {}, OfferSearchParams>, response: Response<Offer[] | Error>) => {
    const params = request.query;
    try {
        const offers = await findOfferByParams(params);
        await addImagesToOffers(offers);
        response.status(200).json(offers);
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            response.send(error);
        }
    }
};

export const getUserOffers = async (request: Request<{ userId: string }, {}, {}>, response: Response<Offer[] | string>) => {
    const offers = await offersDb().where('userId', request.params.userId);
    if (isEmpty(offers)) {
        return response.status(404).send('No offers found for this user');
    }

    await addImagesToOffers(offers);

    response.send(offers);
};

export const getOfferById = async (request: Request<{ id: string }>, response: Response<Offer>) => {
    try {
        const id = request.params.id;
        const offer = await offersDb()
            .where('id', id)
            .first();

        response.status(201).json(offer ? offer : undefined);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`offer with id: ${request.params.id} not found`)
        }
    }
};
