import { IsOptional, IsString } from 'class-validator';

export class AcceptDto {
    @IsString()
    @IsOptional()
    reason: string | null;
}
