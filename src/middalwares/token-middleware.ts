import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction } from 'express';
import { BaseResponse } from 'src/common/apis/api-base';
import { tranfromToERoles } from 'src/common/enums/e-roles';
import { Admins } from 'src/entities/admins';
import { Customers } from 'src/entities/customers';
import { AdminsService } from 'src/modules/admin/services/admins.service';
import { CustomersService } from 'src/modules/customers/services/customers.service';

@Injectable()
export class TokenMiddleWare implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly customersService: CustomersService,
        private readonly adminService: AdminsService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authorization: string = req.headers['authorization'];

        if (!authorization)
            throw new HttpException(
                {
                    message: 'Token is valid',
                    code: HttpStatus.FORBIDDEN,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.FORBIDDEN,
            );

        if (authorization.split(' ').length <= 1)
            throw new HttpException(
                {
                    message: 'Token is valid',
                    code: HttpStatus.FORBIDDEN,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.FORBIDDEN,
            );

        const token = authorization.split(' ')[1];

        try {
            await this.jwtService.verify(token);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'Token is expired',
                    code: HttpStatus.BAD_GATEWAY,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.BAD_GATEWAY,
            );
        }

        const { username, id, type } = this.jwtService.decode(token);

        const typeRole = type === 'admin';

        try {
            const customer: Customers | Admins = typeRole
                ? await this.adminService.adminRepo.findOne({ where: { username, id }, relations: { authorizations: { role: true } } })
                : await this.customersService.customersRepository.findOne({ where: { username, id } });

            req['customer'] = { id: customer.id, roles: customer instanceof Admins ? tranfromToERoles(customer.authorizations) : ['customer'], username: customer.username };
        } catch (error) {
            throw new HttpException(
                {
                    message: 'User is not found. May be account deleted',
                    code: HttpStatus.FOUND,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.FOUND,
            );
        }

        next();
    }
}
