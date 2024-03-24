import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Authorizations } from './authorizations';

@Entity()
export class Roles extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => Authorizations, (authorization) => authorization.role)
    authorizations: Authorizations[];
}
