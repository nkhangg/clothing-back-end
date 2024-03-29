import { ClassSerializerInterceptor, Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { CustomersService } from '../services/customers.service';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { QueriesAdmin } from 'src/payloads/requests/queries/queries-admin.request';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(routes('customers'))
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get('me')
    async curentCustomer(@Customer() customersID: ICustomerSecssion) {
        return await this.customersService.curentCustomer(customersID.id);
    }

    // @Post('')
    // async createCustomers() {
    //     return await this.customersService.createCustomers();
    // }

    @Get()
    async getCustomer(
        @Query() queries: QueriesAdmin<string>,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        return this.customersService.getCustomers({ options: { page, limit }, ...queries });
    }
}
