import multer from "multer";
import { IMAGES_BASE_PATH } from "../utils/constants/constants";

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, `${IMAGES_BASE_PATH}`);
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

export const imageUploadMiddleware = multer({
    storage: storage
});
