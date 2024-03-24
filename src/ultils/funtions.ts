import * as fs from 'fs';
import { join } from 'path';
import { routes } from 'src/common/routes/routers';

export const filePath = (fileName: string, folder: string, res: any) => {
    try {
        const filePath = join(process.cwd(), folder, fileName);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error occurred while sending file:', error);
        return "some thing wen't wrong";
    }
};

export const getHostname = (request: Request) => {
    const hostHeader = request.headers['host'];
    const protocol = request['protocol'];

    return `${protocol}://${hostHeader}`;
};

export const getPathTofile = (request: Request, path_controller: string, name_file: string) => {
    const hostname = getHostname(request);

    try {
        new URL(name_file);
        return name_file;
    } catch (error) {
        return `${hostname}${routes(path_controller)}/${name_file}`;
    }
};

export const deleteImageOnLocal = (name_file: string, folder = 'medias/collections') => {
    fs.unlink(`./${folder}/${name_file}`, (err) => {
        if (err) {
            console.log('123');
        }
    });
};
