import { isEmpty } from "lodash";
import { imageAssignmentsDb } from "../../../models/images_assignments.model";
import { imagesDb } from "../../../models/image.model";
import { Offer, offersDb } from "../../../models/offer.model";
import { formatDateToDDMMYYYY } from "../helpers";
import { OfferSearchParams } from "../../../types/offers.types";
import { CreateOfferDto } from "../../../dtos/offer.dtos";

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

export const insertOfferToDb = async (offer: CreateOfferDto) => {
    const result = await offersDb().insert({
        dateCreated: formatDateToDDMMYYYY(new Date()),
        userId: offer.userId,
        title: offer.title,
        description: offer.description,
        price: offer.price
    });
    return result[0]; // id of created offer
};

export const addImagesToOffers = async (offers: Offer[]) => {
    for (let offer of offers) {
        offer.images = await getOfferImagesPaths(offer.id);
    }
}

export const findOfferByParams = async (params: OfferSearchParams) => {
    return offersDb()
        // '?' at the end prevents SQL injection, it changes that to value of the second argument 
        .whereRaw('LOWER(title) LIKE ?', [`%${getParamsTitle(params.title ? params.title : '')}%`])
        .modify(queryBuilder => {
            if (params.userId) {
                queryBuilder.andWhere('userId', params.userId);
            }
            if (params.id) {
                queryBuilder.andWhere('id', params.id);
            }
        });
};

const getParamsTitle = (title: string | undefined) => title ? title.toLowerCase() : '';
