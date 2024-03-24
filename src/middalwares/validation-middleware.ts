// validation.middleware.ts
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProductDto } from 'src/dtos/products/product-dto';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const uploadDto = plainToClass(ProductDto, req.body);
            const errors = await validate(uploadDto);
            if (errors.length > 0) {
                throw new BadRequestException(errors);
            }
            req['data'] = uploadDto; // Lưu uploadDto vào request để sử dụng ở bước sau
            next();
        } catch (error) {
            next(error);
        }
    }
}
