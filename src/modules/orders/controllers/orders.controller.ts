import { Body, ClassSerializerInterceptor, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { OrderDto } from 'src/dtos/orders/order-dto';
import { OrdersService } from '../services/orders.service';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { QueriesOrders } from 'src/payloads/requests/queries/queries-order.request';
import { Roles } from 'src/common/decorators/roles';
import { ERoles } from 'src/common/enums/e-roles';
import { RolesGuard } from 'src/guards/accepted-role.guard';
import { AcceptDto } from 'src/dtos/orders/accept-dto';

@Controller(routes('orders'))
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    async createOrder(order: OrderDto) {
        console.log(order);
    }

    @Post()
    async createOrders(@Body() order: OrderDto, @Customer() customer: ICustomerSecssion) {
        return await this.ordersService.createOrders(order, customer);
    }

    @Get()
    @Roles([ERoles.READ])
    @UseGuards(RolesGuard)
    async getOrders(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
        @Query() queries: Omit<QueriesOrders<Date>, 'options'>,
    ) {
        return await this.ordersService.getOrders({ options: { page, limit }, ...queries });
    }

    @Get(':id')
    @Roles([ERoles.READ])
    @UseGuards(RolesGuard)
    async getOrder(@Param('id') id: number) {
        return this.ordersService.getOrder(id);
    }

    @Patch(':id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async acceptOrder(@Param('id') id: number, @Customer() user: ICustomerSecssion, @Body() data: AcceptDto) {
        if (!data.reason) {
            return this.ordersService.acceptOrder(id, user);
        }

        return this.ordersService.cancelOrder(id, data, user);
    }

    @Patch('/comfirm/:id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async comfirmPayment(@Param('id') id: number) {
        return this.ordersService.confirmPayment(id);
    }
}
