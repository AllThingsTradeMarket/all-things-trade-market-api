import { isEmpty } from "lodash";
import { imageAssignmentsDb } from "../../../models/images_assignments.model";
import { imagesDb } from "../../../models/image.model";
import { offersDb } from "../../../models/offer.model";
import { formatDateToDDMMYYYY } from "../helpers";
import { createImageAssignments } from "../../../handlers/images_assignments.handlers";

export const getOfferImagesPaths = async (offerId: string) => {
    const imageAssignments = await imageAssignmentsDb().where('offerId', offerId);
    if (isEmpty(imageAssignments)) {
        return [];
    }
    
    const offerImages = [];

    for (let assignment of imageAssignments) {
        const mathingImage = await imagesDb().where('id', assignment.imageId);
        offerImages.push(mathingImage[0]);
    }
    return offerImages.map(image => image.path);
};

export const insertOfferToDb = async (userId: string, title: string, description: string) => {
    const result = await offersDb().insert({
        dateCreated: formatDateToDDMMYYYY(new Date()),
        userId: userId,
        title: title,
        description: description,
    });
    return result[0];
}
