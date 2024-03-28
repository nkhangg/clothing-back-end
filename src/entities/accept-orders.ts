import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './orders';
import { Admins } from './admins';

@Entity()
export class AcceptOrders extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'pat_at', default: null })
    payAt: Date;

    @Column({ default: false })
    cancel: boolean;

    @Column({ default: null })
    reason: string;

    @Column({ default: false })
    read: boolean;

    @Column({ default: 0 })
    print: number;

    @OneToOne(() => Orders, (orders) => orders.acceptOrder)
    @JoinColumn()
    order: Orders;

    @ManyToOne(() => Admins, (admin) => admin.acceptOrders)
    admin: Admins;
}
