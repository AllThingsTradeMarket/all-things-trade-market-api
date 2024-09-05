import express from 'express';
import cors from 'cors';
import usersRouter from '../../routes/users.routes';
import offersRouter from '../../routes/offers.routes';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.urlencoded({extended: false}));
  app.use(express.json());
  app.use('/api/users', usersRouter);
  app.use('api/offers', offersRouter)

  return app;
}
