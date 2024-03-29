import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admins } from 'src/entities/admins';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ICustomerSecssion } from 'src/modules/auths/interface';
import { Roles } from 'src/entities/roles';
import { Categories } from 'src/entities/categories';
import { Customers } from 'src/entities/customers';
import usePagination from 'src/hooks/usePagination';
import { QueriesAdmin } from 'src/payloads/requests/queries/queries-admin.request';
import { AdminDto } from 'src/dtos/admins/admin-dto';
import responses from 'src/common/constants/responses';
import { ERoles } from 'src/common/enums/e-roles';
import { Authorizations } from 'src/entities/authorizations';
import { AuthorDto } from 'src/dtos/admins/author-dto';
import { ChangePasswordDto } from 'src/dtos/admins/change-passoword-dto';

@Injectable()
export class AdminsService {
    constructor(
        @InjectRepository(Admins) readonly adminRepo: Repository<Admins>,
        @InjectRepository(Customers) readonly cusromerRepo: Repository<Customers>,
        @InjectRepository(Roles) readonly rolesRepo: Repository<Roles>,
        @InjectRepository(Authorizations) readonly authorizationsRepo: Repository<Authorizations>,
        @InjectRepository(Categories) readonly categotiesRepo: Repository<Categories>,
    ) {}

    async createAdmins() {
        const data = [
            {
                username: 'thomas',
                password: bcrypt.hashSync('123123', Number(process.env.SALTORROUNDS)),
                fullname: 'Thomas Joson',
                authorizations: [{ role: { id: 4 } }],
            },
            {
                username: 'admin',
                password: bcrypt.hashSync('123123', Number(process.env.SALTORROUNDS)),
                fullname: 'admin',
                authorizations: [{ role: { id: 4 } }, { role: { id: 3 } }, { role: { id: 2 } }, { role: { id: 1 } }],
            },
        ];

        await this.rolesRepo.save([
            {
                id: 1,
                name: 'edit',
            },
            {
                id: 2,
                name: 'create',
            },
            {
                id: 3,
                name: 'delete',
            },
            {
                id: 4,
                name: 'read',
            },
            {
                id: 5,
                name: 'root',
            },
        ]);

        await this.categotiesRepo.save([
            { id: 1, name: 'Áo' },
            { id: 2, name: 'Quần' },
            { id: 3, name: 'Phụ kiện' },
            { id: 4, name: 'Váy' },
            { id: 5, name: 'Áo khoác' },
            { id: 6, name: 'Giày' },
            { id: 7, name: 'Túi xách' },
            { id: 8, name: 'Trang sức' },
        ]);

        return await this.adminRepo.save(data);
    }

    async getRoles() {
        try {
            const response = await this.rolesRepo.find({ where: { deletedAt: IsNull(), name: Not(In([ERoles.ROOT])) } });

            return responses.success.get(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async createAdmin(data: AdminDto) {
        try {
            const findData = await this.adminRepo.findOne({ where: { username: data.username, deletedAt: IsNull() } });

            if (findData) {
                return responses.errors.already({ message: 'Tên đăng nhập đã tồn tại. Vui lòng chọn một tên đăng nhập khác' });
            }

            const roles = new Set(['read']);

            if (data.roles && data.roles.length) {
                data.roles.forEach((item) => {
                    if (!['root'].includes(item)) {
                        roles.add(item);
                    }
                });
            }

            const rolseValid = await this.rolesRepo.find({ where: { name: In(Array.from(roles)) }, select: { id: true } });

            const hashPassword = bcrypt.hashSync(data.password, Number(process.env.SALTORROUNDS));

            const { username, fullname, id, createdAt } = await this.adminRepo.save({
                ...data,
                password: hashPassword,
                authorizations: rolseValid.map((item) => ({ role: item })),
            });

            return responses.success.create({
                username,
                fullname,
                id,
                createdAt,
            });
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async getAdmins({ search, options, sort, role }: QueriesAdmin<string>) {
        const data = await usePagination(this.adminRepo, options, {
            order: { createdAt: sort === 'oldnest' ? 'ASC' : 'DESC' },
            relations: { authorizations: { role: true } },
            where: [
                {
                    deletedAt: IsNull(),
                    username: search && Like(`%${search}%`),
                    authorizations: role && { role: { name: role } },
                },
                {
                    deletedAt: IsNull(),
                    id: search && Like(`%${search}%`),
                    authorizations: role && { role: { name: role } },
                },
                {
                    deletedAt: IsNull(),
                    fullname: search && Like(`%${search}%`),
                    authorizations: role && { role: { name: role } },
                },
            ],
        });

        return data;
    }

    async deleteRoles(id: string, idAuthor: number) {
        try {
            const findData = await this.authorizationsRepo.findOne({
                // where: { authorizations: { admin: { id }, id: idAuthor } },
                where: { admin: { id, deletedAt: IsNull() }, id: idAuthor, deletedAt: IsNull() },
                relations: { admin: { authorizations: { role: true } }, role: true },
            });

            if (!findData) {
                return responses.errors.notFound;
            }

            if (findData.admin.authorizations.find((item) => item.role.name === ERoles.ROOT)) {
                return responses.errors.badrequest('Tài khoản bất khả xâm phậm. Không thể xóa');
            }

            if ([ERoles.READ, ERoles.ROOT].includes(findData.role.name as ERoles) || findData.admin.authorizations.length <= 1) {
                return responses.errors.badrequest('Quyền bất khả xâm phậm. Không thể xóa');
            }

            const result = await this.authorizationsRepo.delete(findData.id);

            if (!result) {
                return responses.errors.handle;
            }

            return responses.success.delete(findData);
        } catch (error) {
            console.log(error);
            return responses.errors.handle;
        }
    }

    async updateAdmin(id: string, data: AuthorDto) {
        try {
            const adminFound = await this.adminRepo.findOne({ where: { id, deletedAt: IsNull() } });

            if (!adminFound) {
                return responses.errors.notFound;
            }

            if (data?.roles && data.roles.length > 0) {
                const validRoles = await this.rolesRepo.find({ where: { id: In(data.roles), deletedAt: IsNull(), name: In([ERoles.READ, ERoles.ROOT]) } });

                if (validRoles.length > 0) {
                    return responses.errors.badrequest('Quyền không thể thêm cho tài khoản này');
                }

                const authorFound = await this.authorizationsRepo.find({
                    where: { admin: { id, deletedAt: IsNull() }, role: { id: In(data.roles), name: Not(In([ERoles.READ, ERoles.ROOT])) } },
                });

                const roleIntoDB = await this.rolesRepo.find({ where: { id: In(data.roles), deletedAt: IsNull() } });

                if (authorFound.length <= 0) {
                    const newRolesId = roleIntoDB.map((item) => {
                        return {
                            admin: adminFound,
                            role: { id: item.id },
                        };
                    });

                    if (!newRolesId.length) return responses.errors.handle;

                    const response = await this.authorizationsRepo.save(newRolesId);

                    if (!response) {
                        return responses.errors.handle;
                    }
                }
            }

            const result = await this.adminRepo.update(id, { fullname: data.fullname });

            if (!result) return responses.errors.handle;

            return responses.success.update(adminFound);
        } catch (error) {
            console.log(error);
            return responses.errors.handle;
        }
    }

    async deleteAdmin(id: string) {
        try {
            const reponse = await this.adminRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: { authorizations: { role: true } } });

            if (!reponse) {
                return responses.errors.notFound;
            }

            if (reponse.authorizations.find((item) => item.role.name === ERoles.ROOT)) {
                return responses.errors.badrequest('Tài khoản không thể xóa');
            }

            this.adminRepo.update(id, { deletedAt: new Date() });

            return responses.success.delete(reponse);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async getCurentAdmin(admin: ICustomerSecssion) {
        try {
            const foundAdmin = await this.adminRepo.findOne({ where: { id: admin.id }, relations: { authorizations: { role: true } } });

            if (!foundAdmin) {
                return {
                    message: 'Data not found',
                    code: HttpStatus.BAD_REQUEST,
                    status: true,
                    data: null,
                };
            }

            return {
                message: 'Get sucessfuly',
                code: HttpStatus.OK,
                status: false,
                data: foundAdmin,
            };
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async getAdmin(id: string) {
        try {
            const response = await this.adminRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: { authorizations: { role: true } } });

            if (!response) return responses.errors.notFound;

            return responses.success.get(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }

    async changePassword(id: string, data: ChangePasswordDto) {
        try {
            const response = await this.adminRepo.findOne({ where: { id, deletedAt: IsNull() } });

            if (!response) return responses.errors.notFound;

            const compare = bcrypt.compareSync(data.oldPassword, response.password);

            if (!compare) return responses.errors.badrequest('Mật khẩu không chính xác');

            const hashPassword = bcrypt.hashSync(data.newPassword, Number(process.env.SALTORROUNDS));

            const result = await this.adminRepo.update(id, { password: hashPassword, updatedAt: new Date(), refreshToken: null });

            if (!result) return responses.errors.handle;

            return responses.success.update(response);
        } catch (error) {
            return responses.errors.handle;
        }
    }
}
