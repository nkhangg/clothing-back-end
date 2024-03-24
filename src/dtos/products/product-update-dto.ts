import { IsNumber, IsString } from 'class-validator';

export class ProductUpdateDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    categoriesID: number;

    showSize: boolean;
}
