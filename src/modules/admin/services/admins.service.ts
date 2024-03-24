import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admins } from 'src/entities/admins';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { BaseResponse } from 'src/common/apis/api-base';

@Injectable()
export class AdminsService {
    constructor(@InjectRepository(Admins) readonly adminRepo: Repository<Admins>) {}

    async createAdmins() {
        const data = [
            {
                username: 'thomas',
                password: bcrypt.hashSync('123123', Number(process.env.SALTORROUNDS)),
                fullname: 'Thomas Joson',
                authorizations: [{ role: { id: 4 } }],
            },
        ];

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
