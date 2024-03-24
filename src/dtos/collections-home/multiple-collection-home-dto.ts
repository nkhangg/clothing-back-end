import { IsNotEmpty, IsString } from 'class-validator';

export class MultipleCollectionHome {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    file: string;

    @IsString()
    @IsNotEmpty()
    title: string;
}
