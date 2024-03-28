import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export interface QueriesRequest<S> {
    options?: IPaginationOptions;
    search?: string;
    deleted?: boolean;
    max?: S;
    min?: S;
}
