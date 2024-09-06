import {z} from 'zod';
import { db } from '../db/knex';
import { databaseNames } from '../utils/constants/database_names';

const ImageSchema = z.object({
    id: z.string(),
    path: z.string()
});

export type Image = z.infer<typeof ImageSchema>;
export const imagesDb = db<Image>(databaseNames.IMAGES);
