import { IsString } from 'class-validator';

export class CollectionHomeDto {
    @IsString()
    title: string;

    image: string;
}
