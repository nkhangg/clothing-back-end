import { Authorizations } from 'src/entities/authorizations';

export enum ERoles {
    CREATE = 2,
    EDIT = 1,
    DELETE = 3,
    READ = 4,
}

export const tranfromToERoles = (roles: Authorizations[]) => {
    return roles.map((item) => {
        return item.role.id as ERoles;
    });
};
export const valuesRoles = () => {
    const prevValues = Object.values(ERoles);

    return prevValues.filter((item) => Number.isInteger(item));
};
