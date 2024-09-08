import bcrypt from "bcrypt";
import { UserSearchParams } from "../../../types/users.types";
import { GetUserDto } from "../../../dtos/user.dtos";
import { User, usersDb } from "../../../models/user.model";

const saltRounds = 10;

export const getHashedPassword = (password: string) => {
	const salt = bcrypt.genSaltSync(saltRounds);
	return bcrypt.hashSync(password, salt);
};

export const comparePassword = (plain: string, hashed: string) =>
	bcrypt.compareSync(plain, hashed);

export const findUsersByParams = async (params: UserSearchParams): Promise<User[]> => {
    return usersDb()
		.whereIn('id', params.ids ? params.ids : []);
};

export const mapToGetUserDto = (user: User): GetUserDto => ({
	email: user.email,
	firstName: user.firstName,
	lastName: user.lastName,
	username: user.username,
	id: user.id
});