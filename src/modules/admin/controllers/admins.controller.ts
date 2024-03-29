import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { AdminsService } from '../services/admins.service';
import { Customer } from 'src/common/decorators/customers';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { QueriesAdmin } from 'src/payloads/requests/queries/queries-admin.request';
import { AdminDto } from 'src/dtos/admins/admin-dto';
import { ERoles } from 'src/common/enums/e-roles';
import { Roles } from 'src/common/decorators/roles';
import { RolesGuard } from 'src/guards/accepted-role.guard';
import { AuthorDto } from 'src/dtos/admins/author-dto';
import { ChangePasswordDto } from 'src/dtos/admins/change-passoword-dto';

@Controller(routes('admins'))
@UseInterceptors(ClassSerializerInterceptor)
export class AdminsController {
    constructor(private readonly adminService: AdminsService) {}

    // @Post()
    // async createAdmins() {
    //     return this.adminService.createAdmins();
    // }

    @Get('current')
    async admin(@Customer() user: ICustomerSecssion) {
        return this.adminService.getCurentAdmin(user);
    }

    @Get('roles')
    @Roles([ERoles.READ])
    @UseGuards(RolesGuard)
    async getRoles() {
        return this.adminService.getRoles();
    }

    @Get()
    @Roles([ERoles.READ])
    @UseGuards(RolesGuard)
    async getAdmins(
        @Query() queries: QueriesAdmin<string>,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        return this.adminService.getAdmins({ options: { page, limit }, ...queries });
    }

    @Get(':id')
    @Roles([ERoles.READ])
    @UseGuards(RolesGuard)
    async getAdmin(@Param('id') id: string) {
        return this.adminService.getAdmin(id);
    }

    @Post()
    @Roles([ERoles.ROOT])
    @UseGuards(RolesGuard)
    async createAdmin(@Body() data: AdminDto) {
        return this.adminService.createAdmin(data);
    }

    @Put(':id')
    @Roles([ERoles.ROOT])
    @UseGuards(RolesGuard)
    async updateAdmin(@Body() data: AuthorDto, @Param('id') id: string) {
        return this.adminService.updateAdmin(id, data);
    }

    @Patch(':id')
    @Roles([ERoles.EDIT])
    @UseGuards(RolesGuard)
    async changePasswordAdmin(@Body() data: ChangePasswordDto, @Param('id') id: string) {
        return this.adminService.changePassword(id, data);
    }

    @Delete(':id')
    @Roles([ERoles.ROOT])
    @UseGuards(RolesGuard)
    async deleteAdmin(@Param('id') id: string) {
        return this.adminService.deleteAdmin(id);
    }

    @Delete('roles/:id/:idAuthor')
    @Roles([ERoles.ROOT])
    @UseGuards(RolesGuard)
    async deleteRole(@Param('id') id: string, @Param('idAuthor') idAuthor: number) {
        return this.adminService.deleteRoles(id, idAuthor);
    }
}
