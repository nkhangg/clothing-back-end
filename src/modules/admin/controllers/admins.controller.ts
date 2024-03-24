import { ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { AdminsService } from '../services/admins.service';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';

@Controller(routes('admins'))
@UseInterceptors(ClassSerializerInterceptor)
export class AdminsController {
    constructor(private readonly adminService: AdminsService) {}

    @Post()
    async createAdmin() {
        return this.adminService.createAdmins();
    }

    @Get('current')
    async admin(@Customer() user: ICustomerSecssion) {
        return this.adminService.admin(user);
    }
}
