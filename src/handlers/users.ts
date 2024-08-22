import { Request, Response } from "express-serve-static-core";
import { CreateUserDto } from "../dtos/user.dtos";
import { USERS } from "../mock/users";
import { User } from "../types/response";
import { connectedKnex } from "../db/knex";
import { knex } from "knex";

const DB_NAME = 'users'

export const getUsers = (request: Request, response: Response) => {
    response.send(USERS);
};

export const getUserById = (request: Request<{id: string}>, response: Response<User | string>) => {
    const user = USERS.find(user => user.id === request.params.id);
    response.send(user ? user : 'user does not exist');
};

export const createUser = async (request: Request<{}, {}, CreateUserDto>, response: Response) => {
    try {
        const result = await connectedKnex(DB_NAME).insert(request.body);
        response.status(201).json({id: result[0]});
    } catch(e: any) {
        console.log(e.message);
        response.status(500).json({error: `cannot post: ${e.message}`});
    }
};
