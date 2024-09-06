import {z} from 'zod';

const ImageSchema = z.object({
    id: z.string(),
    path: z.string()
});

export type Image = z.infer<typeof ImageSchema>;
