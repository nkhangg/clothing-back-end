import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { FindManyOptions, Repository } from 'typeorm';

async function usePagination<T extends BaseEntity>(queryFN: Repository<T>, options: IPaginationOptions, query?: FindManyOptions<T>): Promise<Pagination<T>> {
    const page = Number(options.page || 1);

    const limit = Number(options.limit || 10);

    const skip = (page - 1) * limit;

    const [data, total] = await queryFN.findAndCount({
        skip,
        take: limit,
        ...query,
    });

    const lastPage = Math.ceil(total / limit);
    // const nextPage = page + 1 > lastPage ? null : page + 1;
    // const prevPage = page - 1 < 1 ? null : page - 1;

    return {
        items: data,
        meta: {
            currentPage: page,
            totalPages: lastPage,
            totalItems: total,
            itemsPerPage: limit,
            itemCount: data.length,
        },
    };
}

export default usePagination;
