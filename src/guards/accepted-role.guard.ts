import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BaseResponse } from 'src/common/apis/api-base';
import { Roles } from 'src/common/decorators/roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get(Roles, context.getHandler());
        if (!roles.length || !roles) {
            throw new HttpException(
                {
                    message: 'Forbiden',
                    code: HttpStatus.FORBIDDEN,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.FORBIDDEN,
            );
        }

        const request = context.switchToHttp().getRequest();
        const user = request.customer;
        const result = roles.every((item) => user.roles.includes(item));

        if (result) {
            return true;
        }

        throw new HttpException(
            {
                message: 'Forbiden',
                code: HttpStatus.FORBIDDEN,
                data: null,
                status: true,
            } as BaseResponse<any>,
            HttpStatus.FORBIDDEN,
        );
    }
}
