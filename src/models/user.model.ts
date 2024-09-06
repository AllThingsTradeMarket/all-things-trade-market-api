import {z} from 'zod';
import { db } from '../db/knex';
import { databaseNames } from '../utils/constants/database_names';

const UserSchema = z.object({
    username: z.string(),
    id: z.number(),
    email: z.string(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export const usersDb = () => db<User>(databaseNames.USERS);