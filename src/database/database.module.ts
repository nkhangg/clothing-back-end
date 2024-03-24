import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/entities/roles';
import { Customers } from 'src/entities/customers';
import { Authorizations } from 'src/entities/authorizations';
import { Admins } from 'src/entities/admins';
import { Orders } from 'src/entities/orders';
import { AcceptOrders } from 'src/entities/accept-orders';
import { OrderDetails } from 'src/entities/order-details';
import { Sizes } from 'src/entities/sizes';
import { Reviews } from 'src/entities/reviews';
import { Products } from 'src/entities/products';
import { Categories } from 'src/entities/categories';
import { Images } from 'src/entities/images';
import { CollectionHome } from 'src/entities/collection-home';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [Sizes, Roles, Admins, Orders, Reviews, Customers, OrderDetails, AcceptOrders, Authorizations, Products, Categories, Images, CollectionHome],
            synchronize: Boolean(process.env.SYCHRONIZE_MODE),
        }),
    ],
    controllers: [],
    providers: [],
})
export class DatabaseModule {}
