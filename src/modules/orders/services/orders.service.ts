import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Admins } from 'src/entities/admins';
import { Customers } from 'src/entities/customers';
import { OrderDetails } from 'src/entities/order-details';
import { Orders } from 'src/entities/orders';
import { Products } from 'src/entities/products';
import { Between, IsNull, Like, Repository } from 'typeorm';
import { dummyOrdersDData } from 'src/data/dummy-order-data';
import { OrderDto } from 'src/dtos/orders/order-dto';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import responses from 'src/common/constants/responses';
import { Sizes } from 'src/entities/sizes';
import { ProductOrderDto } from 'src/dtos/orders/product-order-dto';
import { QueriesOrders } from 'src/payloads/requests/queries/queries-order.request';
import usePagination from 'src/hooks/usePagination';
import { AcceptOrders } from 'src/entities/accept-orders';
import { AcceptDto } from 'src/dtos/orders/accept-dto';
@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Products) private readonly productRepo: Repository<Products>,
        @InjectRepository(Customers) private readonly customerRepo: Repository<Customers>,
        @InjectRepository(Admins) private readonly adminRepo: Repository<Admins>,
        @InjectRepository(Orders) private readonly orderRepo: Repository<Orders>,
        @InjectRepository(AcceptOrders) private readonly acceptRepo: Repository<AcceptOrders>,
        @InjectRepository(Sizes) private readonly sizesRepo: Repository<Sizes>,
        @InjectRepository(OrderDetails) private readonly orderDRepo: Repository<OrderDetails>,
    ) {}

    async processOrderDetail(data: ProductOrderDto[]) {
        const resutls = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const response = await this.sizesRepo.findOne({ where: { product: { id: item.productId }, id: item.sizeId, deletedAt: IsNull() }, relations: { product: true } });

            if (!response || !item) {
                throw new HttpException(responses.errors.notFound, HttpStatus.NOT_FOUND);
            }

            if (response.store < item.quantity) {
                throw new HttpException(
                    responses.errors.invalid({
                        message: `Hiện tại mặt hàng ${response.product.name}, kích thước ${response.name} không đủ cung ứng. Rất xin lỗi về sự bất tiện này`,
                        code: HttpStatus.PAYLOAD_TOO_LARGE,
                    }),
                    HttpStatus.PAYLOAD_TOO_LARGE,
                );
            }

            resutls.push({
                price: response.price,
                quantity: item.quantity,
                discount: response.discount,
                size: response,
            });
        }

        return resutls;
    }
    async processUpdateQuantity(data: ProductOrderDto[]) {
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const response = await this.sizesRepo.findOne({ where: { product: { id: item.productId }, id: item.sizeId, deletedAt: IsNull() }, relations: { product: true } });

            if (!response || !item) {
                throw new HttpException(responses.errors.notFound, HttpStatus.NOT_FOUND);
            }

            if (response.store < item.quantity) {
                throw new HttpException(
                    responses.errors.invalid({
                        message: `Hiện tại mặt hàng ${response.product.name}, kích thước ${response.name} không đủ cung ứng. Rất xin lỗi về sự bất tiện này`,
                        code: HttpStatus.PAYLOAD_TOO_LARGE,
                    }),
                    HttpStatus.PAYLOAD_TOO_LARGE,
                );
            }

            this.sizesRepo.update(response.id, { store: response.store - item.quantity });
        }
    }

    async createOrders({ products, ...order }: OrderDto, customer: ICustomerSecssion) {
        const customerDB = await this.customerRepo.findOne({ where: { id: customer.id, username: customer.username, deletedAt: IsNull() } });

        // make is customer. Beacause customer must buy
        if (!customerDB) {
            return responses.errors.notFound;
        }

        const productDataIntoDB = await this.processOrderDetail(products);

        if (productDataIntoDB.length <= 0) {
            return responses.errors.handle;
        }

        const resutlIntoDB = { ...order, orderDetail: productDataIntoDB, customer: { id: customer.id } };

        const results = await this.orderRepo.save(resutlIntoDB);

        await this.processUpdateQuantity(products);

        return responses.success.create(results);
    }

    async createDOrders() {
        return await this.orderDRepo.save(dummyOrdersDData);
    }

    async getOrders({ options, sort, search, min, max, state }: QueriesOrders<Date>) {
        const startQueries = () => {
            if (state === 'pending') return { cancel: IsNull() };

            if (state === 'refunded') return { cancel: true };

            if (state === 'delivered') return { cancel: false };
        };

        const data = await usePagination(this.orderRepo, options, {
            order: { createdAt: sort === 'oldnest' ? 'ASC' : 'DESC' },
            relations: { customer: true, acceptOrder: true },
            where: [
                {
                    deletedAt: IsNull(),
                    fullname: search && Like(`%${search}%`),
                    acceptOrder: state && startQueries(),
                    createdAt: min && max && Between(!min && max ? new Date() : min, max),
                },
                {
                    deletedAt: IsNull(),
                    customer: [{ username: search && Like(`%${search}%`) }],
                    acceptOrder: state && startQueries(),
                    createdAt: min && max && Between(!min && max ? new Date() : min, max),
                },
                {
                    email: search && Like(`%${search}%`),
                },
                {
                    phone: search && Like(`%${search}%`),
                },
                {
                    orderDetail: { size: { product: { id: search && Like(`%${search}%`) } } },
                },
            ],
        });

        return data;
    }

    async getOrder(id: number) {
        const foudData = await this.orderRepo.findOne({
            where: { id, deletedAt: IsNull() },
            relations: { customer: true, acceptOrder: true, orderDetail: { size: { product: true } } },
        });

        if (!foudData) return responses.errors.notFound;

        return responses.success.get(foudData);
    }

    async acceptOrder(id: number, user: ICustomerSecssion) {
        try {
            const admin = await this.adminRepo.findOne({ where: { id: user.id } });
            const order = await this.orderRepo.findOne({ where: { id } });

            if (!admin || !order) {
                return responses.errors.notFound;
            }

            const foudData = await this.acceptRepo.findOne({ where: { order: { id: order.id } } });

            if (foudData) {
                return responses.errors.already({ message: 'Bạn đã thao tác với đơn này rồi' });
            }

            const result = await this.acceptRepo.save({
                order,
                admin,
            });

            return responses.success.create(result);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async restoreQuantity(id: number) {
        const response = await this.orderRepo.findOne({ where: { id }, relations: { orderDetail: { size: true } } });

        response.orderDetail.forEach((item) => {
            this.sizesRepo.update(item.size.id, { store: item.size.store + item.quantity });
        });

        // for (let i = 0; i < response.orderDetail.length; i++) {
        //     const item = response.orderDetail[i];
        //     await this.sizesRepo.update(item.size.id, { store: item.size.store + item.quantity });
        // }
    }

    async cancelOrder(id: number, { reason }: AcceptDto, user: ICustomerSecssion) {
        try {
            const admin = await this.adminRepo.findOne({ where: { id: user.id } });
            const order = await this.orderRepo.findOne({ where: { id } });

            if (!admin || !order) {
                return responses.errors.notFound;
            }

            const foudData = await this.acceptRepo.findOne({ where: { order: { id: order.id } } });

            if ((foudData && foudData.payAt) || (foudData && foudData.cancel)) {
                return responses.errors.already({ message: 'Bạn đã thao tác với đơn này rồi' });
            }

            if (foudData && !foudData.cancel) {
                await this.acceptRepo.update(foudData.id, { cancel: true, reason });

                this.restoreQuantity(id);

                return responses.success.ajust<AcceptOrders>(foudData, 'Cập nhật thành công');
            }

            const result = await this.acceptRepo.save({
                order,
                admin,
                reason,
                cancel: true,
            });

            this.restoreQuantity(id);

            return responses.success.ajust<AcceptOrders>(result, 'Hủy thành công thành công');
        } catch (error) {
            console.log(error);
            return responses.errors.handle;
        }
    }

    async confirmPayment(id: number) {
        try {
            const response = await this.orderRepo.findOne({ where: { id }, relations: { acceptOrder: true } });

            if (!response) {
                return responses.errors.notFound;
            }

            if (response.acceptOrder.cancel || response.acceptOrder.payAt || !response.acceptOrder) {
                return responses.errors.invalid({ message: 'Không thể thao tác. Vui lòng thử lại' });
            }

            await this.acceptRepo.update(response.acceptOrder.id, { payAt: new Date() });

            return responses.success.ajust(response, 'Xác nhận thành công');
        } catch (error) {
            return responses.errors.handle;
        }
    }
}
