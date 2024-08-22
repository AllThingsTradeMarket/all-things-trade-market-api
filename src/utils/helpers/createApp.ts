import express from 'express';
import cors from 'cors';
import usersRouter from '../../routes/users';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.urlencoded({extended: false}));
  app.use(express.json());
  app.use('/api/users', usersRouter);

  return app;
}
