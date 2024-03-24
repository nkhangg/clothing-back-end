import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Authorizations } from './authorizations';
import { AcceptOrders } from './accept-orders';
import { Reviews } from './reviews';
import { CollectionHome } from './collection-home';
import { Exclude } from 'class-transformer';

@Entity()
export class Admins extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    fullname: string | null;

    @Column({ name: 'refresh_token' })
    refreshToken: string | null;

    @OneToMany(() => Authorizations, (authorization) => authorization.admin, { cascade: true })
    authorizations: Authorizations[];

    @OneToMany(() => AcceptOrders, (acceptOrders) => acceptOrders.admin)
    acceptOrders: AcceptOrders[];

    @OneToMany(() => Reviews, (reviews) => reviews.adminReplay)
    reviews: Reviews[];

    @OneToMany(() => CollectionHome, (collectionHome) => collectionHome.admin, { cascade: true })
    collectionHome: CollectionHome[];
}
