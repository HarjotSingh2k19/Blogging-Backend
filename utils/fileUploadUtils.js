import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { join } from 'path'
import multer from "multer";
import fs from "fs"

const pathToDestination = join(__dirname, '..' ,'uploads')
// separate folder
// 1 folder -> uniquename save -> blog -> filename
export const uploadUserFile = multer({
    storage: multer.diskStorage({
        destination: function(req,file,cb)
        {
            cb(null, pathToDestination);
        },
        filename: function(req,file,cb)
        {
            const {sub} = req.jwt;

            console.log(`file name is ${file.originalname}`)
            const fileNameUpdated = sub + req.body.title + ".jpg";
            fs.mkdirSync(pathToDestination, { recursive: true })
            req.body.image = fileNameUpdated;
            req.body.user = sub;
            cb(null, fileNameUpdated);
        }
    })
}).single("user_file");

// blog -> title image 
