import { Request, Response } from 'express-serve-static-core';
import { db } from '../db/knex';
import { CreateImageAssignmentDto } from '../dtos/image_assignment.dtos';
import _ from 'lodash';
import { ImageAssignment } from '../models/images_assignments.model';

const assignmentsDb = db<ImageAssignment>('images_assignments');

export const getOfferImages = async (request: Request<{}, {}, {offerId: string}>, response: Response) => {
    
};

export const createImageAssignments = async (assignment: CreateImageAssignmentDto) => {
    const imagesIds = assignment.imagesIds
    if (!_.isEmpty(imagesIds) && assignment.offerId) {
        imagesIds.map(async imageId => await assignmentsDb.insert({
            imageId,
            offerId: assignment.offerId
        }));
        console.log('assignments created successfully');
    }
};
