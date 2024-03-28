import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponse } from 'src/common/apis/api-base';
import responses from 'src/common/constants/responses';
import { CategoriesDto } from 'src/dtos/categories/categories-dto';
import { Categories } from 'src/entities/categories';
import { QueriesRequest } from 'src/payloads/requests/queries/queries.request';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categories)
        public categoriesRepository: Repository<Categories>,
    ) {}

    async getCategories(queries: QueriesRequest<number>): Promise<BaseResponse<Categories[]>> {
        const data = await this.categoriesRepository.find({ where: { deletedAt: queries.deleted ? Not(IsNull()) : IsNull() }, order: { createdAt: 'DESC' } });

        return {
            message: 'Categories Sucessfuly',
            code: HttpStatus.OK,
            status: false,
            data,
        };
    }

    async deleteCategories(id: number): Promise<BaseResponse<Categories>> {
        try {
            const response = await this.categoriesRepository.findOne({ where: { id, deletedAt: IsNull() } });

            if (!response) {
                return responses.errors.notFound;
            }

            const result = await this.categoriesRepository.update(id, { deletedAt: new Date() });

            if (!result) {
                return responses.errors.handle;
            }

            return responses.success.delete(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async restoreCategories(id: number): Promise<BaseResponse<Categories>> {
        try {
            const response = await this.categoriesRepository.findOne({ where: { id, deletedAt: Not(IsNull()) } });

            if (!response) {
                return responses.errors.notFound;
            }

            const result = await this.categoriesRepository.update(id, { deletedAt: null, updatedAt: new Date() });

            if (!result) {
                return responses.errors.handle;
            }

            return responses.success.restore(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async updateCategories(id: number, data: CategoriesDto): Promise<BaseResponse<Categories>> {
        try {
            const response = await this.categoriesRepository.findOne({ where: { id, deletedAt: IsNull() } });

            if (!response) {
                return responses.errors.notFound;
            }

            const result = await this.categoriesRepository.update(id, { name: data.name, updatedAt: new Date() });

            if (!result) {
                return responses.errors.handle;
            }

            return responses.success.update(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async createCategories(data: CategoriesDto): Promise<BaseResponse<Categories>> {
        try {
            const result = await this.categoriesRepository.save({ name: data.name });

            if (!result) {
                return responses.errors.handle;
            }

            return responses.success.create(result);
        } catch (error) {
            return responses.errors.handle;
        }
    }
}
