import { BaseEntity } from 'src/common/database/BaseEntity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Admins } from './admins';
import { Roles } from './roles';

@Entity()
export class Authorizations extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Admins, (admins) => admins.authorizations)
    admin: Admins;
    @ManyToOne(() => Roles, (roles) => roles.authorizations)
    role: Roles;
}
