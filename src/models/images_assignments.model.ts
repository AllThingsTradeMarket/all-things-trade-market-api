import {z} from 'zod';
import { db } from '../db/knex';
import { databaseNames } from '../utils/constants/database_names';

const ImageAsignmentSchema = z.object({
    id: z.string(),
    imageId: z.number(),
    offerId: z.number()
});

export type ImageAssignment = z.infer<typeof ImageAsignmentSchema>;
export const imageAssignmentsDb = () => db<ImageAssignment>(databaseNames.IMAGE_ASSIGNMENTS);
