import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Products } from './products';
import { Exclude } from 'class-transformer';

@Entity()
export class Images extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Exclude()
    @Column({ default: 0 })
    index: number;

    @Exclude()
    @Column({ name: 'cloud_id' })
    cloudId: string;

    @Exclude()
    @Column({ default: 'images' })
    type: 'images' | 'videos';

    @ManyToOne(() => Products, (product) => product.images)
    product: Products;
}
