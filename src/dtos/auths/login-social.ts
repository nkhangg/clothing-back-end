import { IsEmail, IsString } from 'class-validator';

export class LoginSocialDto {
    @IsEmail()
    @IsString()
    email: string;
}
