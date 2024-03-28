import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/entities/products';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { Images } from 'src/entities/images';
import { Categories } from 'src/entities/categories';
import { Roles } from 'src/entities/roles';
import { Sizes } from 'src/entities/sizes';
import { Orders } from 'src/entities/orders';

@Module({ imports: [TypeOrmModule.forFeature([Products, Images, Categories, Roles, Sizes, Orders])], providers: [ProductsService], controllers: [ProductsController] })
export class ProductsModule {}
