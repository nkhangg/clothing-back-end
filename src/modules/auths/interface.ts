import { ERoles } from 'src/common/enums/e-roles';

export interface ISiginResponse {
    token: string;
    refreshToken: string;
}

export interface ICustomerSecssion {
    id: string;
    username: string;
    roles: ERoles[];
}
