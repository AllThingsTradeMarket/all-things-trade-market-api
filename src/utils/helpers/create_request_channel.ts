import amqp from 'amqplib/callback_api';
import { RABBITMQ_URI, TIMEOUT_DURATION } from '../constants/constants';
import { generateUuid } from './helpers';
import { Response } from 'express-serve-static-core';
import { io } from '../..';

export const createRequestChannel = <RequestDataType>(requestData: RequestDataType, queue_name: string, 
    webSocketEvent: string, response: Response) => {
    amqp.connect(RABBITMQ_URI, (err, connection) => {
        handleConnectionError(err, response);

        connection.createChannel((err, channel) => {
            handleChannelError(err, response);

            const queue = queue_name;
            const correlationId = generateUuid();
            const replyQueue = 'amq.rabbitmq.reply-to';
            const msg = JSON.stringify(requestData);

            let timeoutHandle = createTimeoutHandle(channel, response);
            channel.assertQueue('', { exclusive: true }, (err, q) => {
                if (err) throw err;

                channel.consume(replyQueue, (msg) => {
                    if (msg && msg.properties.correlationId === correlationId) {
                        clearTimeout(timeoutHandle); 
                        const responseData = JSON.parse(msg.content.toString());
                        console.log('Received response:', responseData);
                        io.emit(webSocketEvent, responseData);
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
}

const createTimeoutHandle = (channel: any, response: Response) => {
    return setTimeout(() => {
        console.error('Timeout waiting for response from RabbitMQ');
        response.status(504).json({ error: 'Timeout waiting for response from RabbitMQ' });  // 504 Gateway Timeout
        channel.close();
    }, TIMEOUT_DURATION);
}

const handleConnectionError = (err: unknown, response: Response) => {
    if (err) {
        console.error('RabbitMQ connection error', err);
        return response.status(500).json({ error: 'RabbitMQ connection error' });
    }
}

const handleChannelError = (err: unknown, response: Response) => {
    if (err) {
        console.error('RabbitMQ channel error', err);
        return response.status(500).json({ error: 'RabbitMQ channel error' });
    }
}