import { Request } from "express";
import multer, { StorageEngine } from "multer"
import path from "path";


const storage:StorageEngine  = multer.diskStorage({
    filename: (req:Request, file:Express.Multer.File, cb) => {
        const fn = Date.now() + path.extname(file.originalname);
        cb(null, fn);
    },
});

const profileUpload = multer({ storage }).single("hero");
export {profileUpload}