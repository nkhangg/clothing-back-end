import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
    @IsString()
    @IsOptional()
    fullname?: string | null;

    @IsOptional()
    @IsString()
    phone?: string | null;

    @IsOptional()
    @IsString()
    province?: string | null;

    @IsOptional()
    @IsString()
    district?: string | null;

    @IsOptional()
    @IsString()
    ward?: string | null;

    @IsOptional()
    @IsString()
    address?: string | null;
}
