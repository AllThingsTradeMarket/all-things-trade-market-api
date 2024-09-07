import { isEmpty } from "lodash";
import { imageAssignmentsDb } from "../../../models/images_assignments.model";
import { imagesDb } from "../../../models/image.model";
import { Offer, offersDb } from "../../../models/offer.model";
import { formatDateToDDMMYYYY } from "../helpers";
import { OfferSearchParams } from "../../../types/offers.types";

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
};

export const addImagesToOffers = async (offers: Offer[]) => {
    for (let offer of offers) {
        offer.images = await getOfferImagesPaths(offer.id);
    }
}

export const findOfferByParams = async (params: OfferSearchParams) => {
    console.log(params);
    return offersDb()
        // '?' at the end prevents SQL injection, it changes that to value of the second argument 
        .whereRaw('LOWER(title) LIKE ?', [`%${getParamsTitle(params.title)}%`])
        .modify(queryBuilder => {
            if (params.userId) {
                queryBuilder.andWhere('userId', params.userId);
            }
        });
};

const getParamsTitle = (title: string | undefined) => title ? title.toLowerCase() : '';
