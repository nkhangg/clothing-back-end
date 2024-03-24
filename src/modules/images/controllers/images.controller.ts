import { Controller, Get, Param, Res } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { filePath } from 'src/ultils/funtions';

@Controller(routes('images'))
export class ImagesController {
    // constructor(private readonly collectionService: ConllectionsHomeService) {}

    @Get('image-collection/:name')
    async getImageCollection(@Param('name') name: string, @Res() res: any) {
        return filePath(name, 'medias/collections/', res);
    }

    @Get('image-products/:name')
    async getImageProduct(@Param('name') name: string, @Res() res: any) {
        return filePath(name, 'medias/products/', res);
    }
}
