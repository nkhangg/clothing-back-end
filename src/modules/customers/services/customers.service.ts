import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponse } from 'src/common/apis/api-base';
import { Customers } from 'src/entities/customers';
import { Repository } from 'typeorm';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customers)
        public customersRepository: Repository<Customers>,
    ) {}

    async curentCustomer(customerId: string): Promise<BaseResponse<Customers>> {
        const customer = await this.customersRepository.findOne({ where: { id: customerId } });

        return {
            message: 'Get Successfuly',
            status: false,
            code: HttpStatus.OK,
            data: customer,
        };
    }
}
