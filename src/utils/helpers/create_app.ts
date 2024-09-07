import express from 'express';
import cors from 'cors';
import usersRouter from '../../routes/users.routes';
import offersRouter from '../../routes/offers.routes';
import exchangeOffersRouter from '../../routes/exchange_offer.routes';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.urlencoded({extended: false}));
  app.use(express.json({limit: '5mb'}));
  app.use('/resources', express.static('resources'));
  app.use('/api/users', usersRouter);
  app.use('/api/offers', offersRouter);
  app.use('/api/exchange_offers', exchangeOffersRouter);

  return app;
}
