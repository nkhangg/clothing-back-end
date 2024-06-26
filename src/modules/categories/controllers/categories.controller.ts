import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { routes } from 'src/common/routes/routers';
import { Roles } from 'src/common/decorators/roles';
import { ERoles } from 'src/common/enums/e-roles';
import { QueriesRequest } from 'src/payloads/requests/queries/queries.request';
import { CategoriesDto } from 'src/dtos/categories/categories-dto';
import { RolesGuard } from 'src/guards/accepted-role.guard';

@Controller(routes('categories'))
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    async getCategories(@Query() queries: QueriesRequest<number>) {
        return this.categoriesService.getCategories(queries);
    }

    @Delete(':id')
    @Roles([ERoles.DELETE])
    @UseGuards(RolesGuard)
    async deleteCategories(@Param('id') id: number) {
        return this.categoriesService.deleteCategories(id);
    }

    @Put(':id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async reStoreCategories(@Param('id') id: number) {
        return this.categoriesService.restoreCategories(id);
    }

    @Patch(':id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async updateCategories(@Param('id') id: number, @Body() data: CategoriesDto) {
        return this.categoriesService.updateCategories(id, data);
    }

    @Post()
    @Roles([ERoles.CREATE])
    @UseGuards(RolesGuard)
    async createCategories(@Body() data: CategoriesDto) {
        return this.categoriesService.createCategories(data);
    }
}
