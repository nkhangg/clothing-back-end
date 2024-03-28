import { IsArray, IsEmail, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { ProductOrderDto } from './product-order-dto';
import { Type } from 'class-transformer';

export class OrderDto {
    @IsString()
    fullname: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsPhoneNumber('VN')
    phone: string;

    @IsString()
    province: string;

    @IsString()
    district: string;

    @IsString()
    ward: string;

    @IsString()
    address: string;

    @IsString()
    @IsOptional()
    description: string | null;

    @IsArray()
    @ValidateNested()
    @Type(() => ProductOrderDto)
    products: ProductOrderDto[];
}
