import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponse } from 'src/common/apis/api-base';
import { dummyUserData } from 'src/data/dummy-user-data';
import * as bcrypt from 'bcrypt';
import { Customers } from 'src/entities/customers';
import usePagination from 'src/hooks/usePagination';
import { QueriesAdmin } from 'src/payloads/requests/queries/queries-admin.request';
import { IsNull, Like, Repository } from 'typeorm';

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
}
