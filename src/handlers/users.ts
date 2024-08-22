import { Request, Response } from "express-serve-static-core";
import { CreateUserDto } from "../dtos/user.dtos";
import { USERS } from "../mock/users";
import { User } from "../types/response";
import { connectedKnex } from "../db/knex";

export const getUsers = (request: Request, response: Response) => {
    response.send(USERS);
};

export const getUserById = (request: Request<{id: string}>, response: Response<User | string>) => {
    const user = USERS.find(user => user.id === request.params.id);
    response.send(user ? user : 'user does not exist');
};

export const createUser = (request: Request<{}, {}, CreateUserDto>, response: Response) => {
    return connectedKnex.insert(request.body);
};