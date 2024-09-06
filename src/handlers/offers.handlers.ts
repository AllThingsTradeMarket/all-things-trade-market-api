import { Request, Response } from 'express-serve-static-core';
import { db } from '../db/knex';
import { Offer } from '../models/offer.model';
import { CreateOfferDto } from '../dtos/offer.dtos';
import _ from 'lodash';
import { IMAGES_BASE_PATH } from '../utils/constants/constants';
import { imageUploadMiddleware } from '../middleware/images-upload.middleware';
import { Image } from '../models/image.model';
import { createImageAssignments } from './images_assignments.handlers';

const DB_NAME = 'offers'

const offersDb = db<Offer>(DB_NAME);
const imagesDb = db<Image>('images');

export const getOffers = async (request: Request, response: Response<Offer[]>) => {
    const offers = await offersDb.select('*');
    response.send(offers);
};

export const getOfferById = async (request: Request<{id: string}>, response: Response<Offer>) => {
    try {
        const id = request.params.id;
        const offer = await offersDb
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
        if (!_.isEmpty(uploadedFiles)) {
            imageIds = await Promise.all(
                uploadedFiles.map(async (file) => {
                    const imagePath = `${IMAGES_BASE_PATH}/${file.filename}`;
                    const result = await imagesDb.insert({ path: imagePath }).first();
                    return result;
                })
            );
        }
        const offerId = await db(DB_NAME).insert(request.body).first();
        if (offerId && !imageIds.some(id => typeof id === 'undefined')) {
            await createImageAssignments({
                offerId: offerId.toString(),
                imagesIds: imageIds.map(id => id!.toString())
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
