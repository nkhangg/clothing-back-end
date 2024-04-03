import { IsEmail, IsString } from 'class-validator';

export class RegisterSocialDto {
    @IsString()
    username: string;

    @IsEmail()
    @IsString()
    email: string;
}
