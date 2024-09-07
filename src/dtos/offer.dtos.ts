export type CreateOfferDto = {
    userId: string;
    title: string;
    description: string;
    price: number;
    images: File[]
}
