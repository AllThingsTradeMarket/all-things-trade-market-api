import { Request, Response } from 'express-serve-static-core';
import { AuthUserDto, CreateUserDto, GetUserDto } from '../dtos/user.dtos';
import { User, usersDb } from '../models/user.model';
import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI } from '../utils/constants/constants';
import { comparePassword, findUsersByParams, getHashedPassword, mapToGetUserDto } from '../utils/helpers/userHelpers/user.helpers';
import { UserSearchParams } from '../types/users.types';
import { queues_names } from '../utils/constants/queues_names';

export const getUsers = async (request: Request<{}, {}, {}, UserSearchParams>, response: Response<GetUserDto[]>) => {
    try {
        const users = await findUsersByParams(request.query);
        console.log(users);
        response.status(200).json(users.map(user => mapToGetUserDto(user)));
    } catch (error) {
        console.error(error);
    }
};

export const getUserById = async (request: Request<{ id: string }>, response: Response<GetUserDto>) => {
    try {
        const id = request.params.id;
        const user = await usersDb()
            .where('id', id)
            .first();

        response.send(user ? mapToGetUserDto(user) : undefined);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`User with id: ${request.params.id} not found`);
        }
    }
};

export const createUser = async (request: Request<{}, {}, CreateUserDto>, response: Response) => {
    try {
        const hashedPassword = getHashedPassword(request.body.password);
        const userToInsert = { ...request.body, password: hashedPassword };
        amqp.connect(RABBITMQ_URI, (err, connection) => {
            if (err) {
                console.error('RabbitMQ connection error', err);
                return response.status(500).json({ error: 'RabbitMQ connection error' });
            }

            connection.createChannel((err, channel) => {
                if (err) {
                    console.error('RabbitMQ channel error', err);
                    return response.status(500).json({ error: 'RabbitMQ channel error' });
                }

                const queue = queues_names.USER_QUEUE;
                const msg = JSON.stringify(userToInsert);

                channel.assertQueue(queue, { durable: true });
                channel.sendToQueue(queue, Buffer.from(msg));

                console.log('Message sent to RabbitMQ:', msg);
                response.status(202).json({ message: 'User creation is being processed' });
            });
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};

export const authUser = async (request: Request<{}, {}, AuthUserDto>, response: Response) => {
    try {
        const user = (await usersDb()).find(user => user.email === request.body.email);
        if (user && comparePassword(request.body.password, user.password)) {
            return response.status(201).json({ id: user.id, username: user.username });
        }
        response.status(404).json({ message: 'User with such data not found' })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};
