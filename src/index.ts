import { createApp } from './utils/helpers/create_app';
import http from 'http';
import { Server } from 'socket.io';

const app = createApp();
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type'],
      credentials: false
    }
  });

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT ? process.env.PORT : 3000;

server.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
});
