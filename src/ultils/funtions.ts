import * as fs from 'fs';
import { join } from 'path';
import { routes } from 'src/common/routes/routers';
import { Sizes } from 'src/entities/sizes';

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
            console.log('err in deleteImageOnLocal', err);
        }
    });
};

// array = ['XL', 's', '1', '10', '2xl', '3', '0', 'xs', 'm', '3T', 'xxl', 'xxs', 'one size'];
export const sortSize = (array: Sizes[]) => {
    const ORDER = ['one size', 'xxs', 'xs', 's', 'm', 'l', 'xl', '2xl', 'xxl'];

    array.sort((a, b) => {
        const newa = a.name.toLowerCase();
        const newb = b.name.toLowerCase();

        let nra = parseInt(newa);
        let nrb = parseInt(newb);

        if (ORDER.indexOf(newa) != -1) nra = NaN;
        if (ORDER.indexOf(newb) != -1) nrb = NaN;

        if (nrb === 0) return 1;
        if ((nra && !nrb) || nra === 0) return -1;
        if (!nra && nrb) return 1;
        if (nra && nrb) {
            if (nra == nrb) {
                return newa.substr(('' + nra).length).localeCompare(newa.substr(('' + nra).length));
            } else {
                return nra - nrb;
            }
        } else {
            return ORDER.indexOf(newa) - ORDER.indexOf(newb);
        }
    });

    return array;
};
