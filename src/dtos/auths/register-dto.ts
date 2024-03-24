import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;
}
