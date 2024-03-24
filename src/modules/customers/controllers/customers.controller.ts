import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { CustomersService } from '../services/customers.service';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(routes('customers'))
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get('me')
    async curentCustomer(@Customer() customersID: ICustomerSecssion) {
        return await this.customersService.curentCustomer(customersID.id);
    }
}
