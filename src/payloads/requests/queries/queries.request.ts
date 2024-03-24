import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export interface QueriesRequest {
    options?: IPaginationOptions;
    search?: string;
    max?: number;
    min?: number;
}
