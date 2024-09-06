import { Router } from 'express';
import { getOfferImages } from '../handlers/images_assignments.handlers';

const imagesAssignmentsRouter = Router();

imagesAssignmentsRouter.get('/:offerId', getOfferImages);

export default imagesAssignmentsRouter;
