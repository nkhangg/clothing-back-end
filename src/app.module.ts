import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthsModule } from './modules/auths/auths.module';
import { ConfigModule } from '@nestjs/config';
import { TokenMiddleWare } from './middalwares/token-middleware';
import { CustomersController } from './modules/customers/controllers/customers.controller';
import { CustomerModule } from './modules/customers/customers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/produts.module';
import { AdminsModule } from './modules/admin/admins.module';
import { ConllectionsHomeModule } from './modules/conllections-home/conllections-home.module';
import { ConllectionsHomeController } from './modules/conllections-home/controllers/conllections-home.controller';
import { AdminsController } from './modules/admin/controllers/admins.controller';
import { ImagesModule } from './modules/images/images.module';
import { exludeRoutes } from './middalwares/configs/exclude';
import { ProductsController } from './modules/products/controllers/products.controller';
import { OrdersModule } from './modules/orders/orders.module';
import { OrdersController } from './modules/orders/controllers/orders.controller';
import { CategoriesController } from './modules/categories/controllers/categories.controller';

@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        CustomerModule,
        CategoriesModule,
        AuthsModule,
        ProductsModule,
        AdminsModule,
        ConllectionsHomeModule,
        ImagesModule,
        OrdersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TokenMiddleWare)
            .exclude(...exludeRoutes)
            .forRoutes(CustomersController, ConllectionsHomeController, AdminsController, ProductsController, OrdersController, CategoriesController);
    }
}
