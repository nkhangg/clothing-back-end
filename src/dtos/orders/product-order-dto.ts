import { IsNumber, IsString } from 'class-validator';

export class ProductOrderDto {
    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    sizeId: number;
}
