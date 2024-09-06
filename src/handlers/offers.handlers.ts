import { Request, Response } from 'express-serve-static-core';
import { Offer, offersDb } from '../models/offer.model';
import { CreateOfferDto } from '../dtos/offer.dtos';
import { isEmpty } from 'lodash';
import { IMAGES_BASE_PATH } from '../utils/constants/constants';
import { imagesDb } from '../models/image.model';
import { createImageAssignments } from './images_assignments.handlers';
import { ImageAssignment, imageAssignmentsDb } from '../models/images_assignments.model';
import { getOfferImagesPaths, insertOfferToDb } from '../utils/helpers/offerHelpers/offer.helpers';


export const getOffers = async (request: Request, response: Response<Offer[]>) => {
    const offers = await offersDb().select('');
    response.send(offers);
};

export const getUserOffers = async (request: Request<{userId: string}, {}, {}>, response: Response<Offer[] | string>) => {
    const offers = await offersDb().where('userId', request.params.userId);
    if (isEmpty(offers)) {
        return response.status(404).send('No offers found for this user');
    }

    for (let offer of offers) {
        offer.images = await getOfferImagesPaths(offer.id);
    }
    
    response.send(offers);
};

export const getOfferById = async (request: Request<{id: string}>, response: Response<Offer>) => {
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

export const createOffer = async (request: Request<{}, {}, CreateOfferDto>, response: Response) => {
    try {
        const uploadedFiles = request.files as Express.Multer.File[];
        let imageIds: (number | undefined)[] = [];
        
        if (!isEmpty(uploadedFiles)) {
            for (let file of uploadedFiles) {
                const imagePath = `${IMAGES_BASE_PATH}/${file.filename}`;
                const result = await imagesDb().insert({ path: imagePath });
                imageIds.push(result[0]);
            }
        }

        const { userId, title, description } = request.body;

        const offerId = await insertOfferToDb(userId, title, description);
        if (offerId && !imageIds.some(id => typeof id === 'undefined')) {
            createImageAssignments({
                offerId: offerId.toString(),
                imagesIds: imageIds.map(id => id!.toString()),
            });
        }
        response.status(201).json({id: offerId});
    } catch(error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({error: `cannot post: ${error.message}`});
        }
    }
};
