import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICustomerSecssion } from 'src/modules/auths/interface';

export const Customer = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request['customer'] as ICustomerSecssion;
});
