import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { ConllectionsHomeService } from '../services/conllections-home.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { CollectionHomeDto } from 'src/dtos/collections-home/collection-home-dto';
import { Roles } from 'src/common/decorators/roles';
import { ERoles } from 'src/common/enums/e-roles';
import { RolesGuard } from 'src/guards/accepted-role.guard';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { CollectionHomeDeletesDto } from 'src/dtos/collections-home/collection-home-deletes-dto';
import { storegeConfig } from 'src/common/configs/storege.config';
import { filePath } from 'src/ultils/funtions';
import { MultipleCollectionHome } from 'src/dtos/collections-home/multiple-collection-home-dto';
import { BaseResponse } from 'src/common/apis/api-base';

@Controller(routes('conllections-home'))
@UseInterceptors(ClassSerializerInterceptor)
export class ConllectionsHomeController {
    constructor(private readonly collectionsHomeService: ConllectionsHomeService) {}

    @Post()
    @UseGuards(RolesGuard)
    @Roles([ERoles.CREATE])
    @UseInterceptors(
        FileInterceptor('image', {
            storage: process.env.CLOUND_MODE === 'clound' ? undefined : storegeConfig('collections'),
            fileFilter(req, file, callback) {
                const etx = extname(file.originalname);
                const allowerdExtArr = ['.jpg', '.png', '.jpeg'];
                if (!allowerdExtArr.includes(etx)) {
                    req.fileValidationError = `Wrong extension type. Acceptd file ext are: ${allowerdExtArr.join(', ')}`;
                    callback(null, false);
                } else {
                    const fileSize = parseInt(req.headers['content-length']);
                    if (fileSize > 1024 * 1024 * 5) {
                        req.fileValidationError = `File size is too large. Accepted file size less than 5mb`;
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                }
            },
        }),
    )
    async createCollectionHome(@Req() req: any, @UploadedFile() image: Express.Multer.File, @Body() data: CollectionHomeDto, @Customer() user: ICustomerSecssion) {
        const cloundMode = process.env.CLOUND_MODE === 'clound';

        if (req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }
        if (!image) {
            throw new BadRequestException('File is required');
        }

        return this.collectionsHomeService.createCollectionHome({ ...data, image: cloundMode ? image.path : image.filename }, user, req);
    }

    @Post('multiple')
    @UseInterceptors(
        FilesInterceptor('images', null, {
            storage: process.env.CLOUND_MODE === 'clound' ? undefined : storegeConfig('collections'),
            fileFilter(req, file, callback) {
                const etx = extname(file.originalname);
                const allowerdExtArr = ['.jpg', '.png', '.jpeg'];
                if (!allowerdExtArr.includes(etx)) {
                    req.fileValidationError = `Wrong extension type. Acceptd file ext are: ${allowerdExtArr.join(', ')}`;
                    callback(null, false);
                } else {
                    const fileSize = parseInt(req.headers['content-length']);
                    if (fileSize > 1024 * 1024 * 5) {
                        req.fileValidationError = `File size is too large. Accepted file size less than 5mb`;
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                }
            },
        }),
    )
    async createCollectionsHome(@UploadedFiles() images: Array<Express.Multer.File>, @Body() data: { data: string }, @Customer() user: ICustomerSecssion, @Req() req: any) {
        const cloundMode = process.env.CLOUND_MODE === 'clound';

        if (req.fileValidationError) {
            throw new BadRequestException(req.fileValidationError);
        }
        if (!images) {
            throw new BadRequestException('Files is required');
        }

        try {
            const unWrapData = JSON.parse(data.data) as any[];

            if (unWrapData.length !== images.length) {
                throw new HttpException(
                    {
                        message: 'Input data is incorrect',
                        code: HttpStatus.BAD_REQUEST,
                        data: null,
                        status: true,
                    } as BaseResponse<any>,
                    HttpStatus.BAD_GATEWAY,
                );
            }

            const newData = unWrapData.map((item, index) => ({ ...item, file: cloundMode ? images[index].path : images[index].filename }));
            return this.collectionsHomeService.createCollectionsHomeMultiple(newData as MultipleCollectionHome[], user, req);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'Input data is incorrect',
                    code: HttpStatus.BAD_REQUEST,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    @Get()
    async getCollectionsHome(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
        @Req() request: any,
    ) {
        limit = limit > 100 ? 100 : limit;
        return this.collectionsHomeService.getCollectionsHome({ limit, page: page <= 0 ? 1 : page }, request);
    }

    @Get('image-collection/:name')
    async getImageCollection(@Param('name') name: string, @Res() res: any) {
        return filePath(name, 'medias/collections/', res);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles([ERoles.EDIT])
    async updateCollectionHome(@Param('id') id: number, @Body() data: CollectionHomeDto) {
        return this.collectionsHomeService.updateCollectionHome(id, data);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles([ERoles.DELETE])
    async deleteCollectionHome(@Param('id') id: number) {
        return this.collectionsHomeService.deleteCollectionHome(id);
    }

    @Delete('')
    @UseGuards(RolesGuard)
    @Roles([ERoles.DELETE])
    async deletesCollectionHome(@Body() { ids }: CollectionHomeDeletesDto) {
        return this.collectionsHomeService.deletesCollectionHome(ids);
    }

    @Post('insert')
    async insertCollectionHome() {
        return this.collectionsHomeService.createCollectionsHome();
    }

    @Get(':id')
    async collectionHome(@Param('id') id: number) {
        return this.collectionsHomeService.collection(id);
    }
}
