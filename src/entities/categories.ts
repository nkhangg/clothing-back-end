import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Products } from './products';

@Entity()
export class Categories extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Products, (products) => products.categories)
    products: Products[];
}
