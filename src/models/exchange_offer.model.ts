import {z} from 'zod';
import { db } from '../db/knex';
import { databaseNames } from '../utils/constants/database_names';
import { OfferSchema } from './offer.model';

const ExchangeOfferSchema = z.object({
    id: z.number(),
    senderId: z.number(),
    receiverId: z.number(),
    date: z.string(),
    status: z.string(),
    offeredCash: z.number().optional(),
    offeredProducts: z.array(OfferSchema).optional(),
    requestedProducts: z.array(OfferSchema).optional()
});

export type ExchangeOffer = z.infer<typeof ExchangeOfferSchema>;
export const exchangeOffersDb = () => db<ExchangeOffer>(databaseNames.EXCHANGE_OFFERS);
