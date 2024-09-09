import { Request, Response } from 'express-serve-static-core';
import { Offer, offersDb } from '../models/offer.model';
import { CreateOfferDto } from '../dtos/offer.dtos';
import { isEmpty } from 'lodash';
import { IMAGES_BASE_PATH } from '../utils/constants/constants';
import { addImagesToOffers, findOfferByParams, getOfferWithoutFiles } from '../utils/helpers/offerHelpers/offer.helpers';
import { OfferSearchParams } from '../types/offers.types';
import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI } from '../utils/constants/constants';
import { queues_names } from '../utils/constants/queues_names';
import { io } from '../index';
import { socketEvents } from '../utils/constants/socket_events';
import { generateUuid } from '../utils/helpers/helpers';

export const createOffer = async (request: Request<{}, {}, CreateOfferDto>, response: Response) => {
    try {
        const uploadedFiles = request.files as Express.Multer.File[];
        let imagePaths: string[] = [];
        const offerRequest = getOfferWithoutFiles(request.body);
        if (!isEmpty(uploadedFiles)) {
            imagePaths = uploadedFiles.map(file => `${IMAGES_BASE_PATH}/${file.filename}`);
        }

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

                const queue = queues_names.OFFER_QUEUE;
                const correlationId = generateUuid();
                const replyQueue = 'amq.rabbitmq.reply-to';
                const msg = JSON.stringify({
                    offer: offerRequest,
                    imagePaths: imagePaths
                });
                channel.assertQueue('', { exclusive: true }, (err, q) => {
                    if (err) throw err;

                    channel.consume(replyQueue, (msg) => {
                        if (msg && msg.properties.correlationId === correlationId) {
                            const responseData = JSON.parse(msg.content.toString());
                            console.log('Received response:', responseData);
                            io.emit(socketEvents.NEW_OFFER, responseData);
                            response.status(201).json(responseData);
                            channel.close((err) => {
                                if (err) {
                                    console.error('Error closing channel:', err);
                                } else {
                                    console.log('Channel closed successfully.');
                                }
                            });
                        }
                    }, { noAck: true });

                    channel.sendToQueue(queue, Buffer.from(msg), {
                        correlationId: correlationId,
                        replyTo: replyQueue
                    });

                    console.log('Message sent to RabbitMQ:', msg);
                });
            });
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};

export const getOffers = async (request: Request<{}, {}, {}, OfferSearchParams>, response: Response<Offer[] | Error>) => {
    const params = request.query;
    try {
        const offers = await findOfferByParams(params);
        await addImagesToOffers(offers);
        response.status(200).json(offers);
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            response.send(error);
        }
    }
};

export const getUserOffers = async (request: Request<{ userId: string }, {}, {}>, response: Response<Offer[] | string>) => {
    const offers = await offersDb().where('userId', request.params.userId);
    if (isEmpty(offers)) {
        return response.status(404).send('No offers found for this user');
    }

    await addImagesToOffers(offers);

    response.send(offers);
};

export const getOfferById = async (request: Request<{ id: string }>, response: Response<Offer>) => {
    try {
        const id = request.params.id;
        const offer = await offersDb()
            .where('id', id)
            .first();

        response.status(201).json(offer ? offer : undefined);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`offer with id: ${request.params.id} not found`)
        }
    }
};
