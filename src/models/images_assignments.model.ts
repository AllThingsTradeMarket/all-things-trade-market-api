import {z} from 'zod';

const ImageAsignmentSchema = z.object({
    id: z.string(),
    imageId: z.string(),
    offerId: z.string()
});

export type ImageAssignment = z.infer<typeof ImageAsignmentSchema>;
