import { Request, Response } from 'express-serve-static-core';
import { db } from '../db/knex';
import { Offer, offersDb } from '../models/offer.model';
import { CreateOfferDto } from '../dtos/offer.dtos';
import _ from 'lodash';
import { IMAGES_BASE_PATH } from '../utils/constants/constants';
import { imageUploadMiddleware } from '../middleware/images-upload.middleware';
import { Image, imagesDb } from '../models/image.model';
import { createImageAssignments } from './images_assignments.handlers';
import { formatDateToDDMMYYYY } from '../utils/helpers/helpers';
import { ImageAssignment } from '../models/images_assignments.model';


export const getOffers = async (request: Request, response: Response<Offer[]>) => {
    const offers = await offersDb.select('');
    response.send(offers);
};

export const getUserOffers = async (request: Request<{}, {}, {userId: string}>, response: Response<Offer[]>) => {
    const offers = await offersDb.where('userId', request.body.userId);
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
                    const result = await imagesDb.insert({ path: imagePath });
                    return result[0];
                })
            );
        }

        const { userId, title, description } = request.body;

        const offerResponse = await offersDb.insert({
            dateCreated: formatDateToDDMMYYYY(new Date()),
            userId: userId,
            title: title,
            description: description,
        });
        const offerId = offerResponse[0];
        if (offerId && !imageIds.some(id => typeof id === 'undefined')) {
            await createImageAssignments({
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
