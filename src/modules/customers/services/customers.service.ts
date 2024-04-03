import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponse } from 'src/common/apis/api-base';
import { dummyUserData } from 'src/data/dummy-user-data';
import * as bcrypt from 'bcrypt';
import { Customers } from 'src/entities/customers';
import usePagination from 'src/hooks/usePagination';
import { QueriesAdmin } from 'src/payloads/requests/queries/queries-admin.request';
import { IsNull, Like, Repository } from 'typeorm';
import { UpdateCustomerDto } from 'src/dtos/customers/update-customer-dto';
import responses from 'src/common/constants/responses';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { ChangePasswordDto } from 'src/dtos/admins/change-passoword-dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customers)
        public customersRepository: Repository<Customers>,
    ) {}

    async createCustomers() {
        const data = dummyUserData.map((item) => {
            const hashPassword = bcrypt.hashSync(item.password, Number(process.env.SALTORROUNDS));

            return {
                ...item,
                password: hashPassword,
            };
        });

        const result = await this.customersRepository.save(data);

        return result;
    }

    async curentCustomer(customerId: string): Promise<BaseResponse<Customers>> {
        const customer = await this.customersRepository.findOne({ where: { id: customerId } });

        return {
            message: 'Get Successfuly',
            status: false,
            code: HttpStatus.OK,
            data: customer,
        };
    }

    async getCustomers({ options, search, sort }: QueriesAdmin<string>) {
        const data = await usePagination(this.customersRepository, options, {
            order: { createdAt: sort === 'oldnest' ? 'ASC' : 'DESC' },
            where: [
                {
                    deletedAt: IsNull(),
                    username: search && Like(`%${search}%`),
                },
                {
                    deletedAt: IsNull(),
                    id: search && Like(`%${search}%`),
                },
                {
                    deletedAt: IsNull(),
                    phone: search && Like(`%${search}%`),
                },
                {
                    deletedAt: IsNull(),
                    email: search && Like(`%${search}%`),
                },
            ],
        });

        return data;
    }

    async updateCustomer(data: UpdateCustomerDto, customer: ICustomerSecssion) {
        try {
            const response = await this.customersRepository.findOne({ where: { id: customer.id, deletedAt: IsNull() } });

            if (!response) {
                return responses.errors.notFound;
            }

            const result = await this.customersRepository.update(response.id, { ...data });

            if (!result) return responses.errors.handle;

            return responses.success.update(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async changePassword(customer: ICustomerSecssion, data: ChangePasswordDto) {
        try {
            const response = await this.customersRepository.findOne({ where: { id: customer.id, deletedAt: IsNull() } });

            if (!response) return responses.errors.notFound;

            const compare = bcrypt.compareSync(data.oldPassword, response.password);

            if (!compare) return responses.errors.badrequest('Mật khẩu không chính xác');

            const hashPassword = bcrypt.hashSync(data.newPassword, Number(process.env.SALTORROUNDS));

            const result = await this.customersRepository.update(customer.id, { password: hashPassword, updatedAt: new Date(), refreshToken: null });

            if (!result) return responses.errors.handle;

            return responses.success.update(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }
}
