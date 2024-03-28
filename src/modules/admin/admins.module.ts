import { Module } from '@nestjs/common';
import { AdminsService } from './services/admins.service';
import { AdminsController } from './controllers/admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/entities/roles';
import { Admins } from 'src/entities/admins';
import { Categories } from 'src/entities/categories';

@Module({
    imports: [TypeOrmModule.forFeature([Admins, Roles, Categories])],
    providers: [AdminsService],
    controllers: [AdminsController],
    exports: [AdminsService],
})
export class AdminsModule {}
