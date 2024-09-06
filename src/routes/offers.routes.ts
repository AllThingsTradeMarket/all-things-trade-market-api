import { Router } from 'express'
import { createOffer, getOfferById, getOffers, getUserOffers } from '../handlers/offers.handlers';
import { imageUploadMiddleware } from '../middleware/images-upload.middleware';

const offersRouter = Router();

offersRouter.get('/', getOffers);

offersRouter.get('/:id', getOfferById);

offersRouter.get('/user/:userId', getUserOffers);

offersRouter.post('/', imageUploadMiddleware.array('images'), createOffer);

export default offersRouter;
