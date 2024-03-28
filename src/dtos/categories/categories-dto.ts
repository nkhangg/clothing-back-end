import { IsString } from 'class-validator';

export class CategoriesDto {
    @IsString()
    name: string;
}
