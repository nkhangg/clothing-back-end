import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admins } from 'src/entities/admins';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { BaseResponse } from 'src/common/apis/api-base';
import { Roles } from 'src/entities/roles';
import { Categories } from 'src/entities/categories';

@Injectable()
export class AdminsService {
    constructor(
        @InjectRepository(Admins) readonly adminRepo: Repository<Admins>,
        @InjectRepository(Roles) readonly rolesRepo: Repository<Roles>,
        @InjectRepository(Categories) readonly categotiesRepo: Repository<Categories>,
    ) {}

    async createAdmins() {
        const data = [
            {
                username: 'thomas',
                password: bcrypt.hashSync('123123', Number(process.env.SALTORROUNDS)),
                fullname: 'Thomas Joson',
                authorizations: [{ role: { id: 4 } }],
            },
            {
                username: 'admin',
                password: bcrypt.hashSync('123123', Number(process.env.SALTORROUNDS)),
                fullname: 'admin',
                authorizations: [{ role: { id: 4 } }, { role: { id: 3 } }, { role: { id: 2 } }, { role: { id: 1 } }],
            },
        ];

        await this.rolesRepo.save([
            {
                id: 1,
                name: 'edit',
            },
            {
                id: 2,
                name: 'create',
            },
            {
                id: 3,
                name: 'delete',
            },
            {
                id: 4,
                name: 'read',
            },
        ]);

        await this.categotiesRepo.save([
            { id: 1, name: 'Áo' },
            { id: 2, name: 'Quần' },
            { id: 3, name: 'Phụ kiện' },
            { id: 4, name: 'Váy' },
            { id: 5, name: 'Áo khoác' },
            { id: 6, name: 'Giày' },
            { id: 7, name: 'Túi xách' },
            { id: 8, name: 'Trang sức' },
        ]);

        return await this.adminRepo.save(data);
    }

    async admin(admin: ICustomerSecssion): Promise<BaseResponse<Admins>> {
        const foundAdmin = await this.adminRepo.findOne({ where: { id: admin.id } });

        if (!foundAdmin) {
            return {
                message: 'Data not found',
                code: HttpStatus.BAD_REQUEST,
                status: true,
                data: null,
            };
        }

        return {
            message: 'Get sucessfuly',
            code: HttpStatus.OK,
            status: false,
            data: foundAdmin,
        };
    }
}
