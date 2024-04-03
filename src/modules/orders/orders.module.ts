import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/entities/orders';
import { OrderDetails } from 'src/entities/order-details';
import { Products } from 'src/entities/products';
import { Customers } from 'src/entities/customers';
import { Admins } from 'src/entities/admins';
import { Sizes } from 'src/entities/sizes';
import { AcceptOrders } from 'src/entities/accept-orders';
import { OrdersCustomerController } from './controllers/orders-customer.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Orders, OrderDetails, Products, Customers, Admins, Sizes, AcceptOrders])],
    controllers: [OrdersController, OrdersCustomerController],
    providers: [OrdersService],
})
export class OrdersModule {}
