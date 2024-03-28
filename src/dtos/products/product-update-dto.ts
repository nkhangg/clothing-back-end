import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { SizeUpdateDto } from './size-update-dto';

export class ProductUpdateDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    categoriesID: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SizeUpdateDto)
    sizes: SizeUpdateDto[];

    showSize: boolean;
}
