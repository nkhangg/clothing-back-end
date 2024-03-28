import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { routes } from 'src/common/routes/routers';
import { QueriesProduct } from 'src/payloads/requests/queries/queries-product.request';
import { ProductDto } from 'src/dtos/products/product-dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { filterStorage, storegeConfig } from 'src/common/configs/storege.config';
import { Roles } from 'src/common/decorators/roles';
import { ERoles } from 'src/common/enums/e-roles';
import { RolesGuard } from 'src/guards/accepted-role.guard';
import { ProductUpdateDto } from 'src/dtos/products/product-update-dto';
import { SizeDto } from 'src/dtos/products/size-dto';
import { ImagesDeleteDto } from 'src/dtos/products/images-delete-dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(routes('products'))
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    async getProducts(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
        @Query() queries: Omit<QueriesProduct<number>, 'options'>,
        @Req() request: any,
    ) {
        return await this.productsService.getProducts({ options: { page, limit }, ...queries }, request);
    }

    @Get(':id')
    async getProduct(@Param('id') id: string, @Req() request: any) {
        return await this.productsService.getProduct(id, request);
    }

    @Post('categories')
    async createCategories() {
        return await this.productsService.createCategiries();
    }

    @Post()
    @Roles([ERoles.CREATE])
    @UseGuards(RolesGuard)
    async createProduct(@Body() data: ProductDto) {
        if (!data.images) {
            throw new BadRequestException('Files is required');
        }

        return await this.productsService.createProduct({ ...data });
    }

    @Patch(':id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async updateProduct(@Param('id') id: string, @Body() data: ProductUpdateDto) {
        return await this.productsService.updateProduct(id, data);
    }

    @Delete(':id')
    @Roles([ERoles.DELETE])
    @UseGuards(RolesGuard)
    async deleteProduct(@Param('id') id: string) {
        return await this.productsService.deleteProduct(id);
    }

    @Put('/restore/:id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async restoreProduct(@Param('id') id: string) {
        return await this.productsService.restoreProduct(id);
    }

    // sizes
    @Delete('/sizes/:idproduct/:id')
    @Roles([ERoles.DELETE])
    @UseGuards(RolesGuard)
    async deleteSizeProduct(@Param('id') id: number, @Param('idproduct') idproduct: string) {
        return await this.productsService.deleteSize(id, idproduct);
    }

    @Post('/sizes/:idproduct/:id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async updateSizeProduct(@Param('id') id: number, @Param('idproduct') idproduct: string, @Body() data: SizeDto) {
        return await this.productsService.updateSize(id, idproduct, data);
    }

    @Post('/sizes/:idproduct')
    @Roles([ERoles.CREATE])
    @UseGuards(RolesGuard)
    async createSizeProduct(@Param('idproduct') idproduct: string, @Body() data: SizeDto) {
        return await this.productsService.createSize(idproduct, data);
    }

    // images

    @Delete('/images/:idproduct')
    @Roles([ERoles.DELETE])
    @UseGuards(RolesGuard)
    async deleteImagesProduct(@Param('idproduct') idproduct: string, @Body() data: ImagesDeleteDto) {
        return await this.productsService.deleteIamges(idproduct, data);
    }

    @Post('create-images')
    @Roles([ERoles.CREATE])
    @UseGuards(RolesGuard)
    @UseInterceptors(
        FilesInterceptor('images', 6, {
            storage: process.env.CLOUND_MODE === 'clound' ? undefined : storegeConfig('products'),
            fileFilter: filterStorage,
        }),
    )
    async createImages(@UploadedFiles() images: Array<Express.Multer.File>, @Req() request: any) {
        if (request.fileValidationError) {
            throw new BadRequestException(request.fileValidationError);
        }
        if (!images) {
            throw new BadRequestException('Files is required');
        }

        const stringImages = images.map((item) => item.filename);

        return await this.productsService.createImages(stringImages);
    }

    @Post('create-images/:id')
    @Roles([ERoles.CREATE])
    @UseGuards(RolesGuard)
    @UseInterceptors(
        FilesInterceptor('images', 6, {
            storage: process.env.CLOUND_MODE === 'clound' ? undefined : storegeConfig('products'),
            fileFilter: filterStorage,
        }),
    )
    async createImagesProduct(@UploadedFiles() images: Array<Express.Multer.File>, @Param('id') id: string, @Req() request: any) {
        if (request.fileValidationError) {
            throw new BadRequestException(request.fileValidationError);
        }
        if (!images) {
            throw new BadRequestException('Files is required');
        }

        const stringImages = images.map((item) => item.filename);

        return await this.productsService.createImagesProduct(id, stringImages);
    }

    @Get('chart/:id')
    async getChartProduct(@Param('id') id: string) {
        return this.productsService.getCharProduct(id);
    }
}
