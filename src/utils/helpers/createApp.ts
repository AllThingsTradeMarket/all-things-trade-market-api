import express from 'express';
import cors from 'cors';
import usersRouter from '../../routes/users.routes';
import offersRouter from '../../routes/offers.routes';
import imagesRouter from '../../routes/images.routes';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.urlencoded({extended: false}));
  app.use(express.json({limit: '5mb'}));
  app.use('/resources', express.static('resources'));
  app.use('/api/users', usersRouter);
  app.use('/api/offers', offersRouter);
  app.use('/api/images', imagesRouter);

  return app;
}
