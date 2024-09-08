import { Router } from 'express'
import { createExchangeOffer, getExchangeOffers, updateExchangeOffer } from '../handlers/exchange_offer.handlers';

const exchangeOffersRouter = Router();

exchangeOffersRouter.get('/', getExchangeOffers);

exchangeOffersRouter.post('/', createExchangeOffer);

exchangeOffersRouter.put('/:id', updateExchangeOffer);

export default exchangeOffersRouter;
