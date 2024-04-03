import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './orders';
import { Reviews } from './reviews';
import { Exclude } from 'class-transformer';

@Entity()
export class Customers extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ default: null })
    phone: string | null;

    @Column()
    email: string | null;

    @Column({ default: null })
    province: string | null;

    @Column({ default: null })
    district: string | null;

    @Column({ default: null })
    ward: string | null;

    @Column({ default: null })
    address: string | null;

    @Column({ default: null })
    fullname: string | null;

    @Column({ default: null, name: 'refresh_token' })
    refreshToken: string | null;

    @Column({ default: 'local' })
    @Exclude()
    provider: 'local' | 'google';

    @OneToMany(() => Orders, (orders) => orders.customer)
    orders: Orders[];

    @OneToMany(() => Reviews, (reviews) => reviews.customer)
    reviews: Reviews[];
}
