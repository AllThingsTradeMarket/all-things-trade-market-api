import { Router } from 'express'
import { createOffer, getOfferById, getOffers } from '../handlers/offers.hadnlers';

const offersRouter = Router();

offersRouter.get('/', getOffers);

offersRouter.get('/:id', getOfferById);

offersRouter.post('/', createOffer);

export default offersRouter;
