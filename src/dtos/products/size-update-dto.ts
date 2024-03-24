import { IsString } from 'class-validator';

export class SizeUpdateDto {
    @IsString()
    name: string;
}
