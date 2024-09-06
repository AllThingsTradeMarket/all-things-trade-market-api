import { Router } from 'express';
import { getImageById, uploadImage } from '../handlers/images.handlers';
import { imageUploadMiddleware } from '../middleware/images-upload.middleware';

const imagesRouter = Router();

imagesRouter.get('/:id', getImageById);
imagesRouter.post('/upload', imageUploadMiddleware.single('image'), uploadImage);

export default imagesRouter;
