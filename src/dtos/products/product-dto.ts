import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { SizeDto } from './size-dto';
import { Type } from 'class-transformer';

export class ProductDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    categoriesID: number;

    showSize: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SizeDto)
    sizes: SizeDto[];

    @IsArray()
    @ArrayMinSize(1, { message: 'Sản phẩm phải có ít nhất một ảnh' })
    @ArrayMaxSize(6, { message: 'Tối đa 6 ảnh cho một sản phẩm' })
    images: string[];
}
