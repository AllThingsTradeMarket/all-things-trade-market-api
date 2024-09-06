import { Router } from 'express'
import { createOffer, getOfferById, getOffers } from '../handlers/offers.handlers';
import { imageUploadMiddleware } from '../middleware/images-upload.middleware';

const offersRouter = Router();

offersRouter.get('/', getOffers);

offersRouter.get('/:id', getOfferById);

offersRouter.post('/', imageUploadMiddleware.array('images'), createOffer);

export default offersRouter;
