import { IsNumber, IsString, Min } from 'class-validator';
import { ArrayIncludesString } from 'src/common/decorators/array-includes-string';
import { valuesSize } from 'src/common/enums/e-sizes';

export class SizeDto {
    @IsString()
    @ArrayIncludesString(valuesSize(), { message: 'size name phải là các kí tự ' + valuesSize().join(', ') })
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    store: number;

    @IsNumber()
    @Min(0)
    discount: number;
}
