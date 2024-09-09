import { Request, Response } from 'express-serve-static-core';
import { ExchangeOfferSearchParams } from '../types/exchange_offers.types';
import { CreateExchangeOfferDto, UpdateExchangeOfferDto } from '../dtos/exchange_offer.dtos';
import { ExchangeOffer } from '../models/exchange_offer.model';
import { exchangeOffersDb } from '../models/exchange_offer.model';
import { findExchangeOffersByParams, assignOfferedProductsData, assignRequestedProductsData } from '../utils/helpers/exchangeOfferHelpers/exchange_offer.helpers';
import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI } from '../utils/constants/constants';
import { queues_names } from '../utils/constants/queues_names';
import { generateUuid } from '../utils/helpers/helpers';
import { io } from '..';
import { socketEvents } from '../utils/constants/socket_events';

export const createExchangeOffer = async (request: Request<{}, {}, CreateExchangeOfferDto>, response: Response) => {
    try {
        const exchangeOfferRequest = request.body;
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

                const queue = queues_names.EXCHANGE_OFFER_QUEUE;
                const correlationId = generateUuid();
                const replyQueue = 'amq.rabbitmq.reply-to';
                const msg = JSON.stringify(exchangeOfferRequest);
                channel.assertQueue('', { exclusive: true }, (err, q) => {
                    if (err) throw err;

                    channel.consume(replyQueue, (msg) => {
                        if (msg && msg.properties.correlationId === correlationId) {
                            const responseData = JSON.parse(msg.content.toString());
                            console.log('Received response:', responseData);
                            io.emit(socketEvents.NEW_EXCHANGE_OFFER, responseData);
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
            console.error(error.message);
            response.status(500).json({ error: `cannot post: ${error.message}` });
        }
    }
};

export const getExchangeOffers = async (request: Request<{}, {}, {}, ExchangeOfferSearchParams>, response: Response<ExchangeOffer[] | Error>) => {
    const params = request.query;
    try {
        const exchangeOffers = await findExchangeOffersByParams(params);
        await assignRequestedProductsData(exchangeOffers);
        await assignOfferedProductsData(exchangeOffers);

        response.status(200).json(exchangeOffers);
    } catch(error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            response.send(error);
        }
    }
};

export const updateExchangeOffer = async (request: Request<{id: string}, {}, UpdateExchangeOfferDto>, response: Response) => {
    const exchangeOfferId = request.params.id;
    const { status } = request.body;

    try {
        const result = await exchangeOffersDb()
            .where({ id: exchangeOfferId })
            .update({ status })
            .returning('*');

        if (result.length === 0) {
            return response.status(404).json({ message: 'Exchange offer not found' });
        }

        return response.status(200).json(result[0]);
    } catch (error) {
        console.error('Error updating exchange offer:', error);
        return response.status(500).json({ message: 'An error occurred while updating the exchange offer' });
    }
};

