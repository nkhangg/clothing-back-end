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
import { BaseEntity } from 'src/common/database/BaseEntity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Products) private readonly productRepo: Repository<Products>,
        @InjectRepository(Images) private readonly imagesRepo: Repository<Images>,
        @InjectRepository(Categories) private readonly categoriesRepo: Repository<Categories>,
        @InjectRepository(Roles) private readonly roleRepositories: Repository<Roles>,
        @InjectRepository(Sizes) private readonly sizesRepo: Repository<Sizes>,
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

        const foundProduct = await this.productRepo.findOne({ where: { id } });

        if (!foundProduct) {
            return {
                message: 'Không tìm thấy sản phẩm',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        try {
            const product = await this.productRepo.update(id, {
                id,
                name: data.name,
                description: data.description,
                categories: { id: data.categoriesID },
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

    async getProducts({ options, search, size, categories, min, max }: QueriesProduct, request: Request): Promise<Pagination<Products>> {
        const data = await usePagination(this.productRepo, options, {
            order: { createdAt: 'DESC' },
            where: [
                {
                    deletedAt: IsNull(),
                    name: search && Like(`%${search}%`),
                    categories: { id: categories },
                    sizes: { name: size && size, price: min && max && Between(min, max), deletedAt: IsNull() },
                },
                {
                    deletedAt: IsNull(),
                    description: search && Like(`%${search}%`),
                    categories: { id: categories },
                    sizes: { name: size && size, price: min && max && Between(min, max), deletedAt: IsNull() },
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

        return data;
    }

    async getProduct(id: string, request: Request): Promise<BaseResponse<Products>> {
        try {
            const foudData = await this.productRepo.findOne({
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

            const reuslt = await this.imagesRepo.delete(validIds);

            if (!reuslt) return responses.errors.delete;

            return responses.success.delete(foudDatas);
        } catch (error) {
            return responses.errors.handle;
        }
    }
}
