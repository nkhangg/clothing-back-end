import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Customers } from './customers';
import { AcceptOrders } from './accept-orders';
import { OrderDetails } from './order-details';
import { Reviews } from './reviews';

@Entity()
export class Orders extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    fullname: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @Column()
    province: string;

    @Column()
    district: string;

    @Column()
    ward: string;

    @Column()
    description: string | null;

    @ManyToOne(() => Customers, (customers) => customers.orders, { cascade: true })
    customer: Customers;

    @OneToMany(() => AcceptOrders, (acceptOrders) => acceptOrders.admin, { cascade: true })
    acceptOrders: AcceptOrders[];

    @OneToMany(() => OrderDetails, (orderDetails) => orderDetails.order, { cascade: true })
    orderDetail: OrderDetails[];

    @OneToMany(() => Reviews, (reviews) => reviews.order, { cascade: true })
    reviews: Reviews[];
}
