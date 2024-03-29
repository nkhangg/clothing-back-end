import { IsArray, IsOptional, IsString } from 'class-validator';

export class AuthorDto {
    @IsString()
    fullname: string;

    @IsArray()
    @IsOptional()
    roles: number[] | undefined;
}
