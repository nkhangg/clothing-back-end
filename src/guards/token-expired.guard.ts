import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseResponse } from 'src/common/apis/api-base';

@Injectable()
export class TokenExpiredGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authorization: string = request.headers['authorization'];

        if (!authorization) {
            throw new HttpException(
                {
                    message: 'Request invalid. Make sure logined',
                    code: HttpStatus.SERVICE_UNAVAILABLE,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        if (authorization.split(' ').length <= 1) return false;

        const token = authorization.split(' ')[1];

        const { exp } = await this.jwtService.decode(token);

        const dateNow = new Date();
        const time = Number((dateNow.getTime() / 1000).toFixed(0));

        // time not exprired
        if (time < exp) {
            throw new HttpException(
                {
                    message: "Request invalid. Token is't expire",
                    code: HttpStatus.SERVICE_UNAVAILABLE,
                    data: null,
                    status: true,
                } as BaseResponse<any>,
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        } else {
            return true;
        }
    }
}
