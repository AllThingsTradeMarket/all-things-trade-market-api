export type CreateUserDto = {
    username: string;
    email: string;
    password: string;
}

export type GetUserDto = {
    username: string;
    email: string;
    id: string;
}
