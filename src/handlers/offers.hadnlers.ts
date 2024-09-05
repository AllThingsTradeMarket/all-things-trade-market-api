import { Request, Response } from 'express-serve-static-core';
import { db } from '../db/knex';
import { Offer } from '../models/offer.model';
import { CreateOfferDto } from '../dtos/offer.dtos';

const DB_NAME = 'offers'

const offersDb = db<Offer>(DB_NAME);

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
        const offer = await db(DB_NAME).insert(request.body);
        response.status(201).json({id: offer[0]});
    } catch(error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({error: `cannot post: ${error.message}`});
        }
    }
};
