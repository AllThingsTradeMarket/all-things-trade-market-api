import { CreateOfferDto } from "../dtos/offer.dtos";

export type OfferSearchParams = {
    title?: string;
    userId?: string;
    id?: string;
}

export type OfferCreateRequest = {
    offer: OfferWithoutImages;
    imagePaths: string[];
};

export type OfferCreateResponse = {
    offerId: number;
}

export type OfferWithoutImages = {
    userId: number;
    title: string;
    description: string;
    price: number;
}
