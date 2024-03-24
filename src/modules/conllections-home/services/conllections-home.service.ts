import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { BaseResponse } from 'src/common/apis/api-base';
import { CollectionHomeDto } from 'src/dtos/collections-home/collection-home-dto';
import { MultipleCollectionHome } from 'src/dtos/collections-home/multiple-collection-home-dto';
import { CollectionHome } from 'src/entities/collection-home';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { deleteImageOnCloud, deleteImagesOnCloud, pustImageToCloud } from 'src/services/cloudinary.service';
import { deleteImageOnLocal, getPathTofile } from 'src/ultils/funtions';
import Validate from 'src/ultils/validate';
import { Repository } from 'typeorm';

@Injectable()
export class ConllectionsHomeService {
    constructor(@InjectRepository(CollectionHome) private readonly colectionHomeRepo: Repository<CollectionHome>) {}

    async createCollectionsHome() {
        const data = [
            {
                title: 'Lorem Ipsum',
                image: 'https://media.vov.vn/sites/default/files/styles/large/public/2023-09/rose-1076012.jpg',
                admin: {
                    id: 'deb96ca2-aa92-4c03-bb6b-fb486d730464',
                },
            },
            {
                title: 'Dolor Sit Amet',
                image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2023/7/25/1220914/Rose.jpg?w=800&h=496&crop=auto&scale=both',
                admin: {
                    id: 'deb96ca2-aa92-4c03-bb6b-fb486d730464',
                },
            },
            {
                title: 'Consectetur Adipiscing',
                image: 'https://media.vov.vn/sites/default/files/styles/large/public/2023-09/rose-1076012.jpg',
                admin: {
                    id: 'deb96ca2-aa92-4c03-bb6b-fb486d730464',
                },
            },
            {
                title: 'Pellentesque Egestas',
                image: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2023/7/25/1220914/Rose.jpg?w=800&h=496&crop=auto&scale=both',
                admin: {
                    id: 'deb96ca2-aa92-4c03-bb6b-fb486d730464',
                },
            },
            {
                title: 'Fusce Ultrices',
                image: 'https://media.vov.vn/sites/default/files/styles/large/public/2023-09/rose-1076012.jpg',
                admin: {
                    username: 'deb96ca2-aa92-4c03-bb6b-fb486d730464',
                },
            },
        ];

        return await this.colectionHomeRepo.save(data);
    }

    async collection(id: number) {
        const foudData = await this.colectionHomeRepo.findOne({ where: { id }, relations: { admin: true } });

        if (!foudData) {
            return {
                message: 'Data not found',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        return {
            message: 'Get sucessfully',
            code: HttpStatus.OK,
            data: foudData,
            status: false,
        };
    }

    async createCollectionHome(data: CollectionHomeDto, user: ICustomerSecssion, request: Request): Promise<BaseResponse<CollectionHomeDto>> {
        const mode = process.env.CLOUND_MODE;

        if (!data.image || !data.image.length) {
            return {
                message: 'Upload failure. Make sure image valided',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        if (!user) {
            return {
                message: 'Please login to use',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        if (mode === 'clound') {
            try {
                const response: any = await pustImageToCloud(data.image);

                const { public_id, url } = response;

                const imageData = await this.colectionHomeRepo.save({ title: data.title, image: url, cloudId: public_id, admin: { id: user.id } });

                return {
                    message: 'Upload sucessfuly',
                    code: HttpStatus.OK,
                    data: {
                        image: imageData.image,
                        title: imageData.title,
                    },
                    status: false,
                };
            } catch (error) {
                return {
                    message: 'Upload failure. It could be because the memory is full or an error occurred during processing',
                    code: HttpStatus.BAD_REQUEST,
                    data: null,
                    status: true,
                };
            }
        } else {
            const imageData = await this.colectionHomeRepo.save({ title: data.title, image: data.image, admin: { id: user.id } });

            return {
                message: 'Upload sucessfuly',
                code: HttpStatus.OK,
                data: {
                    image: getPathTofile(request, 'images/image-collection', imageData.image),
                    title: imageData.title,
                },
                status: false,
            };
        }
    }

    async createCollectionsHomeMultiple(data: MultipleCollectionHome[], user: ICustomerSecssion, request: Request): Promise<BaseResponse<any>> {
        const mode = process.env.CLOUND_MODE;

        if (!data) {
            return {
                message: 'Upload failure. Make sure image valided',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        if (!user) {
            return {
                message: 'Please login to use',
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        }

        if (mode === 'clound') {
            try {
                // const response: any = await pustImageToCloud(data.image);

                // const { public_id, url } = response;

                // const imageData = await this.colectionHomeRepo.save({ title: data.title, image: url, cloudId: public_id, admin: { id: user.id } });

                return {
                    message: 'Upload sucessfuly',
                    code: HttpStatus.OK,
                    data: {
                        image: 'Future funtion',
                        title: 'Future funtion',
                    },
                    status: false,
                };
            } catch (error) {
                return {
                    message: 'Upload failure. It could be because the memory is full or an error occurred during processing',
                    code: HttpStatus.BAD_REQUEST,
                    data: null,
                    status: true,
                };
            }
        } else {
            try {
                const newData = data.map((item) => ({
                    title: item.title,
                    image: item.file,
                    admin: { id: user.id },
                }));

                const imageData = await this.colectionHomeRepo.save(newData);

                const response = imageData.map((item) => {
                    return {
                        image: getPathTofile(request, 'images/image-collection', item.image),
                        title: item.title,
                    };
                });

                return {
                    message: 'Upload sucessfuly',
                    code: HttpStatus.OK,
                    data: response,
                    status: false,
                };
            } catch (error) {
                return {
                    message: 'Upload failure. It could be because the memory is full or an error occurred during processing',
                    code: HttpStatus.BAD_REQUEST,
                    data: null,
                    status: true,
                };
            }
        }
    }

    async getCollectionsHome(options: IPaginationOptions, request: Request): Promise<BaseResponse<Pagination<any>>> {
        const queryBuilder = this.colectionHomeRepo.createQueryBuilder('c');
        queryBuilder.innerJoinAndSelect('c.admin', 'admin');
        queryBuilder.orderBy('c.createdAt', 'DESC');
        queryBuilder.getMany();

        const pagiantionData = await paginate<CollectionHome>(queryBuilder, options);

        return {
            message: 'Get sucessfuly',
            code: HttpStatus.OK,
            data: {
                ...pagiantionData,
                items: pagiantionData.items.map((item) => {
                    return {
                        id: item.id,
                        createdAt: item.createdAt,
                        title: item.title,
                        image: !Validate.isBlank(item.cloudId) ? item.image : getPathTofile(request, 'images/image-collection', item.image),
                        user: {
                            createAt: item.admin.createdAt,
                            id: item.admin.id,
                            username: item.admin.username,
                            fullname: item.admin.fullname,
                        },
                    };
                }),
            },
            status: false,
        };
    }

    async updateCollectionHome(id: number, data: CollectionHomeDto): Promise<BaseResponse<CollectionHome>> {
        const dataFound = await this.colectionHomeRepo.findOne({ where: { id } });

        if (!data) {
            return {
                message: "Can't found data",
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        if (data.title == dataFound.title) {
            return {
                message: 'Update Successfuly',
                code: HttpStatus.OK,
                data: dataFound,
                status: false,
            };
        }

        // update collection with data request by admin
        dataFound.title = data.title;

        return {
            message: 'Update Successfuly',
            code: HttpStatus.OK,
            data: await this.colectionHomeRepo.save(dataFound),
            status: false,
        };
    }

    async deleteCollectionHome(id: number): Promise<BaseResponse<CollectionHome>> {
        const dataFound = await this.colectionHomeRepo.findOne({ where: { id } });

        if (!dataFound) {
            return {
                message: 'Data not found',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        if (dataFound.cloudId) {
            try {
                await deleteImageOnCloud(dataFound.cloudId);
            } catch (error) {
                return {
                    message: 'Delete failure. Something when wrong',
                    code: HttpStatus.BAD_GATEWAY,
                    data: null,
                    status: true,
                };
            }
        } else {
            try {
                deleteImageOnLocal(dataFound.image);
            } catch (error) {
                console.log(error);
                return {
                    message: 'Delete failure. Something when wrongggg',
                    code: HttpStatus.BAD_GATEWAY,
                    data: null,
                    status: true,
                };
            }
        }

        // delete collection
        const result = await this.colectionHomeRepo.delete({ id });

        if (result.affected !== 1) {
            return {
                message: 'Delete failure. Something when wrong',
                code: HttpStatus.BAD_GATEWAY,
                data: null,
                status: true,
            };
        }

        return {
            message: 'Delete suceesfuly',
            code: HttpStatus.OK,
            data: dataFound,
            status: false,
        };
    }

    async deletesCollectionHome(ids: number[]): Promise<BaseResponse<CollectionHome[]>> {
        const eroros = [];

        const tranformId = ids.map((id) => ({ id }));

        const dataFounds = await this.colectionHomeRepo.find({ where: tranformId });

        if (!dataFounds || !dataFounds.length) {
            return {
                message: 'Data not found',
                code: HttpStatus.NOT_FOUND,
                data: null,
                status: true,
            };
        }

        // filter data have cloud id to delete on cloudinary
        const dataCloud = dataFounds.filter((item) => item.cloudId).map((i) => i.cloudId);
        const dataLocals = dataFounds.filter((item) => !item.cloudId.length);

        if (dataCloud.length) {
            try {
                await deleteImagesOnCloud(dataCloud);
            } catch (error) {
                return {
                    message: 'Delete failure. Something when wrong',
                    code: HttpStatus.BAD_GATEWAY,
                    data: null,
                    status: true,
                };
            }
        }
        if (dataLocals.length) {
            dataLocals.forEach((item) => {
                try {
                    deleteImageOnLocal(item.image);
                } catch (error) {
                    return {
                        message: 'Delete failure. Something when wrong',
                        code: HttpStatus.BAD_GATEWAY,
                        data: null,
                        status: true,
                    };
                }
            });
        }

        // delete collection

        try {
            await this.colectionHomeRepo.delete(ids);
        } catch (error) {
            return {
                message: 'Delete failure. Something when wrong',
                code: HttpStatus.BAD_GATEWAY,
                data: null,
                status: true,
            };
        }

        return {
            message: eroros.length ? eroros.join(', ') : 'Delete suceesfuly',
            code: HttpStatus.OK,
            data: dataFounds,
            status: false,
        };
    }
}
