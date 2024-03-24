import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Admins } from './admins';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class CollectionHome extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    title: string;

    @Column()
    image: string;

    @Exclude()
    @Column({ name: 'cloud_id' })
    cloudId: string;

    @ManyToOne(() => Admins, (admins) => admins.collectionHome)
    @Expose({ name: 'user' })
    admin: Admins;
}
