import { IsArray } from 'class-validator';

export class CollectionHomeDeletesDto {
    @IsArray()
    ids: number[];
}
