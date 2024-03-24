import { Module } from '@nestjs/common';
import { AuthsController } from './controllers/auths.controller';
import { AuthsService } from './services/auths.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from '../customers/customers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins } from 'src/entities/admins';
import { Roles } from 'src/entities/roles';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CustomerModule,
        JwtModule.register({
            global: true,
            secret: process.env.SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        TypeOrmModule.forFeature([Admins, Roles]),
    ],
    controllers: [AuthsController],
    providers: [AuthsService],
})
export class AuthsModule {}
