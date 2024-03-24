import { ArrayMinSize, IsArray } from 'class-validator';

export class ImagesDeleteDto {
    @IsArray()
    @ArrayMinSize(1)
    ids: number[];
}
