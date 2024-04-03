import { ClassSerializerInterceptor, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { OrdersService } from '../services/orders.service';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(routes('orders-customers'))
export class OrdersCustomerController {
    constructor(private readonly orderService: OrdersService) {}

    @Get('')
    async getOrdersCustomers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
        @Customer() customer: ICustomerSecssion,
    ) {
        return this.orderService.getOrdersCutomers({ options: { page, limit } }, customer);
    }

    @Get(':uuid')
    async getOrderCustomers(@Param('uuid') uuid: string, @Customer() customer: ICustomerSecssion) {
        return this.orderService.getOrderCutomers(uuid, customer);
    }
}
