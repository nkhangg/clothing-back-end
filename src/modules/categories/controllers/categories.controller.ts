import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { routes } from 'src/common/routes/routers';

@Controller(routes('categories'))
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    async getCategories() {
        return this.categoriesService.getCategories();
    }
}
