import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderDetails } from './order-details';
import { Products } from './products';

@Entity()
export class Sizes extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    store: number;

    @Column()
    discount: number;

    @OneToMany(() => OrderDetails, (orderDetail) => orderDetail.size)
    orderDetails: OrderDetails[];

    @ManyToOne(() => Products, (product) => product.sizes)
    product: Products;
}
