import {z} from 'zod';

const UserSchema = z.object({
    username: z.string(),
    id: z.number(),
    email: z.string(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
});

export type User = z.infer<typeof UserSchema>;
