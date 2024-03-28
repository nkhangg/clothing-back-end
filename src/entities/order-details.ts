import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './orders';
import { Sizes } from './sizes';

@Entity()
export class OrderDetails extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    price: number;

    @Column()
    discount: number;

    @Column()
    quantity: number;

    @ManyToOne(() => Orders, (orders) => orders.orderDetail)
    order: Orders;

    @ManyToOne(() => Sizes, (size) => size.orderDetails)
    size: Sizes;
}
