import { CreateImageAssignmentDto } from '../dtos/image_assignment.dtos';
import { isEmpty } from 'lodash';
import { imageAssignmentsDb } from '../models/images_assignments.model';


export const createImageAssignments = async (assignment: CreateImageAssignmentDto) => {
    const imagesIds = assignment.imagesIds;
    if (!isEmpty(imagesIds) && assignment.offerId) {
        for (const imageId of imagesIds) {
            await imageAssignmentsDb().insert({
                imageId,
                offerId: assignment.offerId
            });
        }
    }
};
