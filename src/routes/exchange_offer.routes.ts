import { Router } from 'express'
import { createExchangeOffer, getExchangeOffers } from '../handlers/exchange_offer.handlers';

const exchangeOffersRouter = Router();

exchangeOffersRouter.get('/', getExchangeOffers);

exchangeOffersRouter.post('/', createExchangeOffer);

export default exchangeOffersRouter;
