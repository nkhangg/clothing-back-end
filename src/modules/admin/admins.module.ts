import { Module } from '@nestjs/common';
import { AdminsService } from './services/admins.service';
import { AdminsController } from './controllers/admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/entities/roles';
import { Admins } from 'src/entities/admins';

@Module({
    imports: [TypeOrmModule.forFeature([Admins, Roles])],
    providers: [AdminsService],
    controllers: [AdminsController],
    exports: [AdminsService],
})
export class AdminsModule {}
