export type CreateOfferDto = {
    userId: number;
    title: string;
    description: string;
    price: number;
    images: File[]
}
