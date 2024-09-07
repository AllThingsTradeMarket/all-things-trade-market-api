import { createApp } from './utils/helpers/create_app';

const app = createApp();

const PORT = process.env.PORT ? process.env.PORT : 3000;

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
});
