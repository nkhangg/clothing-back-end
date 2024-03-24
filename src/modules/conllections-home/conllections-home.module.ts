import { Module } from '@nestjs/common';
import { ConllectionsHomeService } from './services/conllections-home.service';
import { ConllectionsHomeController } from './controllers/conllections-home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionHome } from 'src/entities/collection-home';
import { MulterModule } from '@nestjs/platform-express';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [
        TypeOrmModule.forFeature([CollectionHome]),
        MulterModule.register({
            dest: './medias',
        }),
        NestjsFormDataModule,
    ],
    providers: [ConllectionsHomeService],
    controllers: [ConllectionsHomeController],
    exports: [ConllectionsHomeService],
})
export class ConllectionsHomeModule {}
