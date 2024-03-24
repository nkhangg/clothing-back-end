import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from 'src/entities/customers';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Customers])],
    providers: [CustomersService],
    controllers: [CustomersController],
    exports: [CustomersService],
})
export class CustomerModule {}
