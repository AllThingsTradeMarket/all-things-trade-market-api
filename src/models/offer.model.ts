import {z} from 'zod';
import { databaseNames } from '../utils/constants/database_names';
import { db } from '../db/knex';

const OfferSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    dateCreated: z.string()
});

export type Offer = z.infer<typeof OfferSchema>;
export const offersDb = () => db<Offer>(databaseNames.OFFERS);
