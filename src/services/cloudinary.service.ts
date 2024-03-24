import cloudinaryConfig from 'src/common/configs/cloudinary.config';

export const pustImageToCloud = (filepath: string, options = { folder: 'collections' }) => {
    return new Promise((resovle, reject) => {
        cloudinaryConfig.uploader.upload(filepath, { folder: options.folder }, (error, result) => {
            if (error) return reject(error);

            resovle(result);
        });
    });
};
export const deleteImageOnCloud = (filepath: string) => {
    return new Promise((resovle, reject) => {
        cloudinaryConfig.uploader.destroy(filepath, (error, result) => {
            if (error) return reject(error);

            resovle(result);
        });
    });
};
export const deleteImagesOnCloud = (filepaths: string[]) => {
    return new Promise((resovle, reject) => {
        cloudinaryConfig.api.delete_resources(filepaths, (error, result) => {
            if (error) return reject(error);

            resovle(result);
        });
    });
};
