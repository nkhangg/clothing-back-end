import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customers } from './customers';
import { AcceptOrders } from './accept-orders';
import { OrderDetails } from './order-details';
import { Reviews } from './reviews';
import { Expose, Transform } from 'class-transformer';
import { v4 as uuid } from 'uuid';

@Entity()
export class Orders extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ default: () => `'${uuid()}'` })
    uuid: string;

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
    address: string;

    @Column()
    description: string | null;

    @Transform((params) => {
        const order = params.obj as Orders;

        if (!order.acceptOrder) {
            return 'pending';
        }

        if (order.acceptOrder.cancel) {
            return 'refunded';
        }

        return 'delivered';
    })
    @Expose({ toClassOnly: true, toPlainOnly: true })
    state: string;

    @ManyToOne(() => Customers, (customers) => customers.orders, { cascade: true })
    customer: Customers;

    @OneToOne(() => AcceptOrders, (acceptOrders) => acceptOrders.order, { cascade: true })
    @Expose({ name: 'detail' })
    acceptOrder: AcceptOrders;

    @OneToMany(() => OrderDetails, (orderDetails) => orderDetails.order, { cascade: true })
    @Expose({ name: 'data' })
    orderDetail: OrderDetails[];

    @OneToMany(() => Reviews, (reviews) => reviews.order, { cascade: true })
    reviews: Reviews[];
}
