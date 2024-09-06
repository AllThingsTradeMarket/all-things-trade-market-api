import {z} from 'zod';

const OfferSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    dateCreated: z.date()
});

export type Offer = z.infer<typeof OfferSchema>;
