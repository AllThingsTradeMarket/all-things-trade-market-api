import { Request, Response } from 'express-serve-static-core';
import { db } from "../db/knex";
import { Image } from "../models/image.model";
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { IMAGES_BASE_PATH } from '../utils/constants/constants';

const DB_NAME = 'images'

const imagesDb = db<Image>(DB_NAME);

export const getImageById = async (request: Request<{ id: string }>, response: Response) => {
    const image = await imagesDb
        .where('id', request.params.id)
        .first();

    if (!image) {
        response.status(404).send('No such image in database');
        return;
    }

    const imagePath = path.resolve(__dirname, `../../${image.path}`);
    const imageMimeType = mime.contentType(path.extname(imagePath)) || 'application/octet-stream';
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            response.status(404).send('Image not found on server');
            return;
        }
        response.setHeader('Content-Type', imageMimeType);
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(response);
    });
};

export const uploadImage = async (request: Request, response: Response) => {
    if (!request.file) {
        response.status(400).send('No file uploaded');
        return;
    }
    console.log(`uploading an image ${request.file}`);
    const path = `${IMAGES_BASE_PATH}/${request.file.filename}`;
    const result = await imagesDb.insert({ path: path });
    response.status(201).send(`file uploaded successfully! id: ${result[0]}`);
};
