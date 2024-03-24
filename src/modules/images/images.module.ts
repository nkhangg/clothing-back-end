import { Module } from '@nestjs/common';
import { ImagesController } from './controllers/images.controller';
import { ImagesService } from './services/images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionHome } from 'src/entities/collection-home';

@Module({
    imports: [TypeOrmModule.forFeature([CollectionHome])],
    controllers: [ImagesController],
    providers: [ImagesService],
})
export class ImagesModule {}
