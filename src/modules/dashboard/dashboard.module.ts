import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from 'src/entities/customers';
import { Roles } from 'src/entities/roles';
import { Sizes } from 'src/entities/sizes';
import { Products } from 'src/entities/products';
import { Orders } from 'src/entities/orders';
import { AcceptOrders } from 'src/entities/accept-orders';

@Module({
    imports: [TypeOrmModule.forFeature([Customers, Roles, Sizes, Products, Orders, AcceptOrders])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
