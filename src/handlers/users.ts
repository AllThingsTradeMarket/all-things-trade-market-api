import { Request, Response } from 'express-serve-static-core';
import { CreateUserDto } from '../dtos/user.dtos';
import { User } from '../types/response';
import { db } from '../db/knex';
import { getHashedPassword } from '../utils/helpers/userHelpers/user.helpers';
import { query } from 'express-validator'

const DB_NAME = 'users'

const usersDb = db<User>(DB_NAME);

export const getUsers = (request: Request, response: Response) => {

};

export const getUserById = async (request: Request<{id: string}>, response: Response<User | string>) => {
    try {
        const id = request.params.id;
        const user = await usersDb
            .where('id', id)
            .first();

        response.send(user ? user : `user with id: ${id} not found`);
    } catch (error) {
        if (error instanceof Error) {

        }
    }
};

export const createUser = async (request: Request<{}, {}, CreateUserDto>, response: Response) => {
    try {
        const hashedPassword = getHashedPassword(request.body.password);
        const result = await db(DB_NAME).insert({...request.body, password: hashedPassword});
        response.status(201).json({id: result[0]});
    } catch(error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({error: `cannot post: ${error.message}`});
        }
    }
};
