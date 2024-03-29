import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
import { ERoles } from 'src/common/enums/e-roles';

export class AdminDto {
    @IsString()
    fullname?: string;

    @IsString()
    username?: string;

    @IsString()
    @MinLength(6)
    password?: string;

    @IsArray()
    @IsOptional()
    roles: ERoles[] | null;
}
