import { Body, Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { routes } from 'src/common/routes/routers';
import { AuthsService } from '../services/auths.service';
import { BaseResponse } from 'src/common/apis/api-base';
import { ISiginResponse } from '../interface';
import { RegisterDto } from 'src/dtos/auths/register-dto';
import { LoginDto } from 'src/dtos/auths/login-dto';
import { RefreshTokenDto } from 'src/dtos/auths/refresh-token-dto';
import { TokenExpiredGuard } from 'src/guards/token-expired.guard';
import { LoginSocialDto } from 'src/dtos/auths/login-social';
import { RegisterSocialDto } from 'src/dtos/auths/register-social';

@Controller(routes('auths'))
export class AuthsController {
    constructor(private readonly authsService: AuthsService) {}

    @Post('register')
    async register(@Body() sigData: RegisterDto): Promise<BaseResponse<ISiginResponse & { errors?: Partial<RegisterDto> }>> {
        const data = await this.authsService.register(sigData);

        return data;
    }

    @Post('login')
    async login(@Body() sigData: LoginDto, @Query('type') type: 'admin' | string): Promise<BaseResponse<ISiginResponse & { errors?: Partial<LoginDto> }>> {
        const data = await this.authsService.login(sigData, { admin: type === 'admin' });

        return data;
    }

    @Post('register/google/:id')
    async registerWithGoogle(@Param('id') id: string, @Body() sigData: RegisterSocialDto): Promise<BaseResponse<ISiginResponse & { errors?: Partial<RegisterDto> }>> {
        const data = await this.authsService.registerWithGoogle(id, sigData);

        return data;
    }

    @Post('login/google/:id')
    async loginWithGoogle(@Param('id') id: string, @Body() sigData: LoginSocialDto): Promise<BaseResponse<ISiginResponse & { errors?: Partial<RegisterDto> }>> {
        const data = await this.authsService.loginWithGoogle(id, sigData);

        return data;
    }

    @Post('refresh-token')
    @UseGuards(TokenExpiredGuard)
    async refreshToken(@Body() sigData: RefreshTokenDto, @Query('type') type: 'admin' | string) {
        return this.authsService.refreshToken(sigData.refreshToken, { admin: type === 'admin' });
    }
}
