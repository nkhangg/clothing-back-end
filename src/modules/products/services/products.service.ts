import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categories } from 'src/entities/categories';
import { Images } from 'src/entities/images';
import { Products } from 'src/entities/products';
import { Between, IsNull, Not, Like, Repository, In } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/entities/roles';
import { dummyProductData } from 'src/data/dummy-product-data';
import usePagination from 'src/hooks/usePagination';
import { QueriesProduct } from 'src/payloads/requests/queries/queries-product.request';
import { ProductDto } from 'src/dtos/products/product-dto';
import { BaseResponse } from 'src/common/apis/api-base';
import { deleteImageOnLocal, getPathTofile } from 'src/ultils/funtions';
import { ProductUpdateDto } from 'src/dtos/products/product-update-dto';
import { Sizes } from 'src/entities/sizes';
import messages from 'src/common/constants/messages';
import responses from 'src/common/constants/responses';
import { SizeDto } from 'src/dtos/products/size-dto';
import { ImagesDeleteDto } from 'src/dtos/products/images-delete-dto';
import Validate from 'src/ultils/validate';
import { SizeUpdateDto } from 'src/dtos/products/size-update-dto';
import { Orders } from 'src/entities/orders';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Products) private readonly productRepo: Repository<Products>,
        @InjectRepository(Images) private readonly imagesRepo: Repository<Images>,
        @InjectRepository(Categories) private readonly categoriesRepo: Repository<Categories>,
        @InjectRepository(Roles) private readonly roleRepositories: Repository<Roles>,
        @InjectRepository(Sizes) private readonly sizesRepo: Repository<Sizes>,
        @InjectRepository(Orders) private readonly ordersRepo: Repository<Orders>,
    ) {}

    async formatId(prefix: string, number: number) {
        const min_legth = 5;

        let prePrefix = prefix;
        const result = prefix + (number + 1);

        if (result.length < min_legth) {
            prePrefix += '0';
            return this.formatId(prePrefix, number);
        } else {
            return result;
        }
    }

    async incrementId() {
        const items = await this.productRepo.find({ order: { id: 'DESC' } });

        const lastItem = items[0];

        if (!lastItem) return 'PD001';

        const number = lastItem.id.substring(2);
        const prefix = lastItem.id.substring(0, 2);

        const result = Number(number);

        const id = await this.formatId(prefix, result);

        return id;
    }

    async createProducts() {
        return this.productRepo.save(dummyProductData);
    }

    async createProduct(data: ProductDto): Promise<BaseResponse<Products>> {
        const id = await this.incrementId();

        const categories = this.categoriesRepo.findOne({ where: { id: data.categoriesID } });

        if (!categories) {
            return {
                message: 'Danh mục không hợp lệ. Hãy chắn rằng bạn đã chọn đúng',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        if (!data.sizes.length) {
            return {
                message: 'Size không hợp. Hãy chắn rằng bạn thêm size cho sản phẩm này',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        if (!data.images.length) {
            return {
                message: 'Size không hợp. Hãy chắn rằng bạn thêm size cho sản phẩm này',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        const images = data.images.map((image) => ({ name: image }));

        const product = await this.productRepo.save({
            id,
            name: data.name,
            description: data.description,
            categories: { id: data.categoriesID },
            sizes: data.sizes,
            images,
            showSize: data.showSize,
        });

        if (!product) {
            return {
                message: messages.errors.handle,
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        return {
            message: 'Create successfuly',
            status: false,
            code: HttpStatus.CREATED,
            data: product,
        };
    }

    async updateProduct(id: string, data: ProductUpdateDto): Promise<BaseResponse<Products>> {
        const categories = await this.categoriesRepo.findOne({ where: { id: data.categoriesID } });

        if (!categories) {
            return {
                message: 'Danh mục không hợp lệ. Hãy chắn rằng bạn đã chọn đúng',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        const foundProduct = await this.productRepo.findOne({ where: { id }, relations: { sizes: true } });

        if (!foundProduct) {
            return {
                message: 'Không tìm thấy sản phẩm',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        try {
            const acceptSizePro = foundProduct.sizes.filter((size) => size.deletedAt == null);
            const deletedSizePro = foundProduct.sizes.filter((size) => size.deletedAt != null);

            if (data.sizes.length >= acceptSizePro.length) {
                const deletedFoud = deletedSizePro.filter((item) => data.sizes.find((i) => i.name === item.name));

                if (deletedFoud.length) {
                    deletedFoud.forEach((item) => {
                        const matchData = data.sizes.find((i) => i.name === item.name);

                        matchData.id = item.id;
                        matchData['deletedAt'] = null;
                        matchData['updatedAt'] = new Date();
                    });
                } else {
                    const nameData = data.sizes.map((item) => item.name);

                    const setCheck = new Set(nameData);

                    if (nameData.length !== setCheck.size) {
                        return {
                            message: 'Dữ liệu trùng lập. Vui long kiểm tra lại',
                            code: HttpStatus.BAD_REQUEST,
                            data: null,
                            status: true,
                        };
                    }
                }
            }

            if (data.sizes.length < acceptSizePro.length) {
                return {
                    message: 'Không thể xóa kho bằng cách này',
                    code: HttpStatus.BAD_REQUEST,
                    data: null,
                    status: true,
                };
            }

            // Object.assign(foundProduct, {
            //     id,
            //     name: data.name,
            //     description: data.description,
            //     categories: { id: data.categoriesID },
            //     showSize: data.showSize,
            //     sizes: data.sizes,
            // });

            // const resutlData = await this.productRepo.save(foundProduct);

            const resutlData = await this.productRepo.update(foundProduct.id, {
                name: data.name,
                description: data.description,
                categories: { id: data.categoriesID },
                showSize: data.showSize,
            });

            await this.processSizes(data.sizes, foundProduct);

            if (!resutlData) {
                return {
                    message: messages.errors.handle,
                    code: HttpStatus.BAD_REQUEST,
                    data: null,
                    status: true,
                };
            }

            return {
                message: 'Update successfuly',
                status: false,
                code: HttpStatus.OK,
                data: foundProduct,
            };
        } catch (error) {
            console.log(error);
            return {
                message: messages.errors.handle,
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }
    }

    async deleteProduct(id: string) {
        const foundProduct = await this.productRepo.findOne({ where: { id, deletedAt: IsNull() } });

        if (!foundProduct) {
            return {
                message: 'Không tìm thấy sản phẩm',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        this.productRepo.update(id, { deletedAt: new Date() });

        return {
            message: 'Xóa thành công',
            status: false,
            code: HttpStatus.OK,
            data: foundProduct,
        };
    }

    async restoreProduct(id: string) {
        const foundProduct = await this.productRepo.findOne({ where: { id, deletedAt: Not(IsNull()) } });

        if (!foundProduct) {
            return {
                message: 'Không tìm thấy sản phẩm',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        this.productRepo.update(id, { deletedAt: null });

        return {
            message: 'Khôi phục thành công',
            status: false,
            code: HttpStatus.OK,
            data: foundProduct,
        };
    }

    async processData(array: Products[]) {
        for (let i = 0; i < array.length; i++) {
            try {
                // Thực hiện các hoạt động bất đồng bộ ở đây
                const sizes = await this.sizesRepo.find({ where: { deletedAt: IsNull(), product: { id: array[i].id } } });

                array[i].sizes = sizes;
            } catch (error) {
                console.error(`Error processing item ${i}: ${error.message}`);
            }
        }
    }

    async processSizes(sizes: SizeUpdateDto[], product: Products) {
        // const newSize = data.sizes.filter((item) => !item.id);
        // const oldSize = data.sizes.filter((item) => item.id);

        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i];
            if (size.id) {
                await this.sizesRepo.update(size.id, { price: size.price, updatedAt: new Date(), discount: size.discount, store: size.store, deletedAt: null });
            } else {
                await this.sizesRepo.save({ ...size, product });
            }
        }
    }

    async getProducts({ options, search, size, categories, min, max, sort, deleted }: QueriesProduct<number>, request: Request): Promise<Pagination<Products>> {
        const data = await usePagination(this.productRepo, options, {
            order: { createdAt: sort === 'oldnest' ? 'ASC' : 'DESC', images: { id: 'ASC' } },
            where: [
                {
                    deletedAt: deleted ? Not(IsNull()) : IsNull(),
                    name: search && Like(`%${search}%`),
                    categories: { id: categories },
                    sizes: { name: size && size, price: min && max && Between(!min && max ? 0 : min, max), deletedAt: IsNull() },
                },
                {
                    deletedAt: deleted ? Not(IsNull()) : IsNull(),
                    description: search && Like(`%${search}%`),
                    categories: { id: categories },
                    sizes: { name: size && size, price: min && max && Between(!min && max ? 0 : min, max), deletedAt: IsNull() },
                },
            ],
        });

        data.items.forEach((item) => {
            item.images.forEach((image) => {
                if (!image.cloudId.length) {
                    image.name = getPathTofile(request, 'images/image-products', image.name);
                }
            });
        });

        if (!min && !max) {
            await this.processData(data.items);
        }

        return data;
    }

    async getProduct(id: string, request: Request): Promise<BaseResponse<Products>> {
        try {
            const foudData = await this.productRepo.findOne({
                order: { images: { id: 'ASC' }, sizes: { price: 'ASC' } },
                where: { id, deletedAt: IsNull(), sizes: { deletedAt: IsNull() } },
                relations: { sizes: true, images: true, categories: true },
            });

            if (!foudData) {
                if (!foudData) {
                    return {
                        message: 'Không tìm thấy sản phẩm',
                        code: HttpStatus.NOT_FOUND,
                        data: null,
                        status: true,
                    };
                }
            }

            foudData.images.forEach((item) => {
                if (!item.cloudId.length) {
                    item.name = getPathTofile(request, 'images/image-products', item.name);
                }
            });

            return {
                message: 'Get successfuly',
                code: HttpStatus.OK,
                data: foudData,
                status: false,
            };
        } catch (error) {
            return {
                message: 'Không tìm thấy sản phẩm',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }
    }

    async createCategiries() {
        const categories = [
            { id: 1, name: 'Áo' },
            { id: 2, name: 'Quần' },
            { id: 3, name: 'Phụ kiện' },
            { id: 4, name: 'Váy' },
            { id: 5, name: 'Áo khoác' },
            { id: 6, name: 'Giày' },
            { id: 7, name: 'Túi xách' },
            { id: 8, name: 'Trang sức' },
        ];

        return await this.categoriesRepo.save(categories);
    }

    // sizes
    async deleteSize(id: number, idproduct: string) {
        try {
            const foundData = await this.sizesRepo.findOne({
                where: { id, product: { id: idproduct, deletedAt: IsNull() }, deletedAt: IsNull() },
                relations: { product: { sizes: true } },
            });

            if (!foundData) {
                return responses.errors.notFound;
            }

            if (foundData.product.sizes.filter((size) => !size.deletedAt).length <= 1) {
                return responses.errors.delete;
            }

            this.sizesRepo.update(id, { deletedAt: new Date() });

            return responses.success.delete(foundData);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async updateSize(id: number, idproduct: string, data: SizeDto) {
        try {
            const foundData = await this.sizesRepo.findOne({ where: { id, deletedAt: IsNull(), product: { id: idproduct, deletedAt: IsNull() } } });

            console.log(foundData);

            if (!foundData) return responses.errors.notFound;

            const result = await this.sizesRepo.update(id, { ...data, name: foundData.name, updatedAt: new Date() });

            if (!result) {
                return responses.errors.update;
            }

            return responses.success.update(foundData);
        } catch (error) {
            console.log(error);
            return responses.errors.handle;
        }
    }

    async createSize(idproduct: string, data: SizeDto) {
        try {
            const product = await this.productRepo.findOne({ where: { id: idproduct, deletedAt: IsNull() } });

            if (!product) {
                return responses.errors.notFound;
            }

            // nếu không có thì CÓ THỂ thêm được
            const acticeSize = await this.sizesRepo.findOne({ where: { name: data.name, deletedAt: IsNull(), product: { id: idproduct, deletedAt: IsNull() } } });

            const trashSize = await this.sizesRepo.findOne({ where: { name: data.name, deletedAt: Not(IsNull()), product: { id: idproduct, deletedAt: IsNull() } } });

            if (!acticeSize && trashSize) {
                const reuslt = await this.sizesRepo.update(trashSize.id, { ...data, updatedAt: new Date(), deletedAt: null, name: trashSize.name });

                if (reuslt) return responses.success.create(trashSize);
            }

            if (!acticeSize && !trashSize) {
                const reuslt = await this.sizesRepo.save({ ...data });

                if (reuslt) return responses.success.create(reuslt);
            }

            return responses.errors.active;
        } catch (error) {
            console.log(error);
            return responses.errors.handle;
        }
    }

    // images
    async createImages(data: string[]) {
        if (!data.length)
            return {
                message: 'Ảnh không hợp lệ',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        return responses.success.create<typeof data>(data);
    }

    async createImagesProduct(id: string, data: string[]) {
        if (!data.length)
            return {
                message: 'Ảnh không hợp lệ',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };

        try {
            const foundData = await this.productRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: { images: true } });

            if (!foundData) {
                return responses.errors.notFound;
            }

            if (foundData.images.length + data.length > 6 || foundData.images.length === 6 || data.length >= 6) {
                data.forEach((img) => {
                    deleteImageOnLocal(img, 'medias/products');
                });
                return responses.errors.invalid({ message: 'Một sản phẩm chỉ có tối đa 6 ảnh' });
            }

            const dataImages = data.map((item) => ({
                name: item,
                product: foundData,
            }));

            this.imagesRepo.save(dataImages);
        } catch (error) {
            return responses.errors.handle;
        }

        return responses.success.create<typeof data>(data);
    }

    async deleteIamges(idproduct: string, { ids }: ImagesDeleteDto) {
        try {
            const product = await this.productRepo.findOne({ where: { id: idproduct, deletedAt: IsNull() }, relations: { images: true } });

            if (!product) {
                return responses.errors.notFound;
            }

            const foudDatas = await this.imagesRepo.find({ where: { id: In(ids), product: { id: idproduct, deletedAt: IsNull() } } });

            if (!foudDatas.length) return responses.errors.notFound;

            if (foudDatas.length > product.images.length || product.images.length <= 1) return responses.errors.delete;

            if (foudDatas.length == product.images.length) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, ...prev] = foudDatas.map((item) => item.id);

                foudDatas.forEach((item) => {
                    if ((prev as number[]).includes(item.id) && Validate.isBlank(item.cloudId) && !Validate.isUrl(item.name)) {
                        deleteImageOnLocal(item.name, 'medias/products');
                    }
                });

                const reuslt = await this.imagesRepo.delete(prev);

                if (!reuslt) return responses.errors.delete;

                return responses.success.delete(foudDatas, 'Ảnh không được xóa hết. Hệ thống sẽ tự động giữ lại một ảnh ngẩu nhiên');
            }

            const validIds = foudDatas.map((item) => item.id);

            foudDatas.forEach((item) => {
                if (Validate.isBlank(item.cloudId) && !Validate.isUrl(item.name)) {
                    deleteImageOnLocal(item.name, 'medias/products');
                }
            });

            const reuslt = await this.imagesRepo.delete(validIds);

            if (!reuslt) return responses.errors.delete;

            return responses.success.delete(foudDatas);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async procressDataChart(id: string, state: boolean) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const result = await this.ordersRepo
            .createQueryBuilder('o')
            .select('MONTH(o.createdAt) AS month, SUM(od.quantity) AS count')
            .innerJoin('o.orderDetail', 'od')
            .innerJoin('od.size', 's')
            .innerJoin('s.product', 'p')
            .innerJoin('o.acceptOrder', 'ao')
            .where('p.id = :id', { id })
            .andWhere('ao.cancel = :state', { state })
            .andWhere(`YEAR(o.createdAt) = :year`, { year: currentYear })
            .groupBy('MONTH(o.createdAt)')
            .getRawMany();

        return result;
    }

    async getCharProduct(id: string) {
        // sum quantiry with accept order key cancel is false
        const sold = await this.procressDataChart(id, false);

        // sum quantiry with accept order key cancel is true
        const canceled = await this.procressDataChart(id, true);

        if (!sold.length || !canceled.length) {
            responses.success.get([
                { name: 'Đã bán', data: [] },
                { name: 'Đã hủy', data: [] },
            ]);
        }

        // find value max in array
        const findMaxMonth = sold.concat(canceled).map((item) => item.month);

        const length = Math.max(...findMaxMonth);

        // create to clone array
        const resultSold = Array.from({ length }).fill(0);
        const resultCanceled = Array.from({ length }).fill(0);

        // set value with month
        sold.forEach((item) => {
            resultSold[item.month - 1] = Number(item.count);
        });
        canceled.forEach((item) => {
            resultCanceled[item.month - 1] = Number(item.count);
        });

        return responses.success.get([
            { name: 'Đã bán', data: resultSold },
            { name: 'Đã hủy', data: resultCanceled },
        ]);
    }
}
