import { Router } from 'express'
import { createUser, getUserById, getUsers } from '../handlers/users';

const usersRouter = Router();

usersRouter.get('/', getUsers);

usersRouter.get('/:id', getUserById);

usersRouter.post('/', createUser);

export default usersRouter;
