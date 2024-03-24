import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './orders';
import { Admins } from './admins';

@Entity()
export class AcceptOrders extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'pat_at' })
    payAt: Date;

    @Column()
    cancel: boolean;

    @Column()
    reason: string;

    @Column()
    read: boolean;

    @Column()
    print: number;

    @ManyToOne(() => Orders, (orders) => orders.acceptOrders)
    order: Orders;

    @ManyToOne(() => Admins, (admin) => admin.acceptOrders)
    admin: Admins;
}
