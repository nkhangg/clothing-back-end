import { IsString, Length } from 'class-validator';

export class LoginDto {
    @IsString()
    username: string;

    @IsString()
    @Length(6)
    password: string;
}
