import { Authorizations } from 'src/entities/authorizations';

export enum ERoles {
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete',
    READ = 'read',
    CUSTOMER = 'customer',
    ROOT = 'root',
}

export const tranfromToERoles = (roles: Authorizations[]) => {
    return roles.map((item) => {
        return item.role.name as ERoles;
    });
};
export const valuesRoles = () => {
    const prevValues = Object.values(ERoles);

    return prevValues;
};
