import { memoryStorage } from 'multer';

export const MulterStorage = {
    storage: memoryStorage(),
    // storage: diskStorage({
    //     destination: './data/uploads/', // Directory where files will be stored
    //     filename: (req, file, cb) => {
    //     const randomName = Array(32)
    //         .fill(null)
    //         .map(() => Math.round(Math.random() * 16).toString(16))
    //         .join('');
    //     const extension = extname(file.originalname); // Get file extension
    //     cb(null, `${req.user.sub}_${randomName}${extension}`); // Generate a random filename with original extension
    //     }
    // }),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB file size limit (in bytes)
    },
};
