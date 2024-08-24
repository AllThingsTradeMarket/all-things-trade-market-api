import { Router } from 'express'
import { authUser, createUser, getUserById, getUsers } from '../handlers/users.handler';

const usersRouter = Router();

usersRouter.get('/', getUsers);

usersRouter.get('/:id', getUserById);

usersRouter.post('/', createUser);
usersRouter.post('/login', authUser);

export default usersRouter;
