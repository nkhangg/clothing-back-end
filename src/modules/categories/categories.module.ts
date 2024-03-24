import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from 'src/entities/categories';

@Module({
    imports: [TypeOrmModule.forFeature([Categories])],
    providers: [CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService],
})
export class CategoriesModule {}
