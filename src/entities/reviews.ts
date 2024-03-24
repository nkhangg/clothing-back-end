import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customers } from './customers';
import { Admins } from './admins';
import { Orders } from './orders';

@Entity()
export class Reviews extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'nvarchar' })
    content: string;

    @Column()
    stars: number;

    @Column({ name: 'replay_id' })
    replayId: number | null;

    @ManyToOne(() => Customers, (customers) => customers.reviews)
    customer: Customers;

    @ManyToOne(() => Admins, (admin) => admin.reviews)
    adminReplay: Admins;

    @ManyToOne(() => Orders, (orders) => orders.reviews)
    order: Orders;
}
