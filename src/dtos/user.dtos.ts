export type CreateUserDto = {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export type AuthUserDto = {
    email: string;
    password: string;
}

export type GetUserDto = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    id: number;
}
