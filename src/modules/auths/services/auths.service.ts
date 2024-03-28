import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ICustomerSecssion, ISiginResponse } from '../interface';
import { RegisterDto } from 'src/dtos/auths/register-dto';
import { BaseResponse } from 'src/common/apis/api-base';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dtos/auths/login-dto';
import { CustomersService } from 'src/modules/customers/services/customers.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Admins } from 'src/entities/admins';
import { Repository } from 'typeorm';
@Injectable()
export class AuthsService {
    // Contructor
    constructor(
        private readonly customersService: CustomersService,
        @InjectRepository(Admins) private readonly adminRepo: Repository<Admins>,
        private jwtService: JwtService,
    ) {}

    private async generateToken({ username, id }: { username: string; id: string }, options = { type: 'customer' as 'customer' | 'admin' }) {
        return await this.jwtService.signAsync(
            {
                username: username,
                id: id,
                type: options.type,
            },
            {
                expiresIn: options.type === 'admin' ? '1h' : '1d',
            },
        );
    }
    private async generateRefreshToken({ username, id }: { username: string; id: string }, options = { type: 'customer' as 'customer' | 'admin' }) {
        return await this.jwtService.signAsync(
            {
                username: username,
                id: id,
                type: options.type,
            },
            {
                expiresIn: options.type === 'admin' ? '1d' : '2d',
            },
        );
    }

    //  Resgister funtion service
    async register(data: RegisterDto): Promise<BaseResponse<ISiginResponse> & { errors?: Partial<RegisterDto> }> {
        const foundWithUsername = await this.customersService.customersRepository.findOne({
            where: { username: data.username },
        });

        const foundWithEmail = await this.customersService.customersRepository.findOne({
            where: { email: data.email },
        });

        const errors: Partial<RegisterDto> = {};

        if (foundWithUsername) {
            errors.username = 'Tên đăng nhập đã tồn tại';
        }

        if (foundWithEmail) {
            errors.email = 'Email đã tồn tại';
        }

        if (errors.username || errors.email) {
            return {
                message: 'Register failure',
                status: true,
                code: HttpStatus.BAD_REQUEST,
                data: null,
                errors: errors,
            };
        }

        const hashPassword = await bcrypt.hash(data.password, Number(process.env.SALTORROUNDS));

        const newCustomer = await this.customersService.customersRepository.save({
            username: data.username,
            password: hashPassword,
            email: data.email,
        });

        return {
            message: 'Register Successfuly',
            status: false,
            code: HttpStatus.CREATED,
            data: {
                token: await this.generateToken({ username: data.username, id: newCustomer.id }),
                refreshToken: await this.generateToken({ username: data.username, id: newCustomer.id }),
            },
        };
    }

    async login({ username, password }: LoginDto, options = { admin: false }): Promise<BaseResponse<ISiginResponse> & { errors?: Partial<LoginDto> }> {
        // Check if option.admin is true. If true then query and check on Admins table else query on Custumer table
        const type = Boolean(options.admin);
        const foundCustomer = type ? await this.adminRepo.findOne({ where: { username } }) : await this.customersService.customersRepository.findOne({ where: { username } });

        if (!foundCustomer) {
            return {
                message: 'Login failure',
                status: true,
                code: HttpStatus.BAD_REQUEST,
                data: null,
                errors: {
                    username: 'Tên đăng nhập không tồn tại',
                    password: 'Mật khẩu không chính xác',
                },
            };
        }

        const hashPassword = foundCustomer.password;

        const isMatch = await bcrypt.compare(password, hashPassword);

        if (!isMatch) {
            return {
                message: 'Login failure',
                status: true,
                code: HttpStatus.BAD_REQUEST,
                data: null,
                errors: {
                    username: 'Tên đăng nhập không tồn tại',
                    password: 'Mật khẩu không chính xác',
                },
            };
        }

        const refreshToken = await this.generateRefreshToken({ username: username, id: foundCustomer.id }, { type: type ? 'admin' : 'customer' });

        // set refresh token on DB

        if (type) {
            this.adminRepo.save({ ...foundCustomer, refreshToken });
        } else {
            // handle customer something here
        }
        return {
            message: 'Login Successfuly',
            status: false,
            code: HttpStatus.CREATED,
            data: {
                token: await this.generateToken({ username: username, id: foundCustomer.id }, { type: type ? 'admin' : 'customer' }),
                refreshToken: refreshToken,
            },
        };
    }

    async refreshToken(refreshToken: string, options = { admin: false }) {
        try {
            await this.jwtService.verify(refreshToken);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'Refresh failure. Please relogin',
                    status: true,
                    code: 402,
                    data: null,
                },
                402,
            );
        }

        const type = Boolean(options.admin);

        const { id, username }: ICustomerSecssion = this.jwtService.decode(refreshToken);
        const foundCustomer = type ? await this.adminRepo.findOne({ where: { id } }) : await this.customersService.customersRepository.findOne({ where: { id } });

        if (!foundCustomer) {
            throw new HttpException(
                {
                    message: 'Refresh failure',
                    status: true,
                    code: 402,
                    data: null,
                },
                402,
            );
        }

        if (type) {
            if ((foundCustomer as Admins).refreshToken !== refreshToken) {
                throw new HttpException(
                    {
                        message: 'Refresh failure. Token not matches',
                        status: true,
                        code: 402,
                        data: null,
                    },
                    402,
                );
            }
        }

        const newRefreshToken = await this.generateRefreshToken({ username: username, id: foundCustomer.id }, { type: type ? 'admin' : 'customer' });

        if (type) {
            this.adminRepo.save({ ...foundCustomer, refreshToken: newRefreshToken });
        } else {
            // handle customer something here
        }

        return {
            message: 'Refresh sucessfuly',
            status: false,
            code: HttpStatus.CREATED,
            data: {
                token: await this.generateToken({ username: username, id: foundCustomer.id }, { type: type ? 'admin' : 'customer' }),
                refreshToken: newRefreshToken,
            },
        };
    }
}
