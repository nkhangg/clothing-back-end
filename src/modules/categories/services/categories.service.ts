import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponse } from 'src/common/apis/api-base';
import { Categories } from 'src/entities/categories';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categories)
        public categoriesRepository: Repository<Categories>,
    ) {}

    async getCategories(): Promise<BaseResponse<Categories[]>> {
        const data = await this.categoriesRepository.find();

        return {
            message: 'Categories Sucessfuly',
            code: HttpStatus.OK,
            status: false,
            data,
        };
    }
}
