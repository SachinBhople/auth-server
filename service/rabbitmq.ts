import { connect, Channel, Connection, Message } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL: string = process.env.RABBITMQ_URL || '';

let channel: Channel;

const initializeRabbitMQ = async (): Promise<void> => {
    try {
        const connection: Connection = await connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (err) {
        console.error('Failed to connect to RabbitMQ:', err);
        process.exit(1);
    }
};

interface MessageData {
    [key: string]: any;
}

const publishToQueue = (queueName: string, message: MessageData): void => {
    if (!channel) {
        console.error('Channel not initialized.');
        return;
    }
    channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to queue ${queueName}:, message`);
};

const consumeQueue = (queueName: string, callback: (data: MessageData) => void): void => {
    if (!channel) {
        console.error('Channel not initialized.');
        return;
    }
    channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, (msg: Message | null) => {
        if (msg) {
            const data: MessageData = JSON.parse(msg.content.toString());
            callback(data);
            channel.ack(msg);
        }
    }, { noAck: false });
};

export { publishToQueue, consumeQueue, initializeRabbitMQ };