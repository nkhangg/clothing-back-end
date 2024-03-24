import { BaseEntity } from 'src/common/database/BaseEntity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Sizes } from './sizes';
import { Expose } from 'class-transformer';
import { Categories } from './categories';
import { Images } from './images';

@Entity()
export class Products extends BaseEntity {
    @PrimaryColumn({ type: 'varchar', length: 20 })
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ name: 'show_size', default: true })
    showSize: boolean;

    @ManyToOne(() => Categories, (categories) => categories.products, { cascade: true, eager: true })
    @Expose({ name: 'category' })
    categories: Categories;

    @OneToMany(() => Sizes, (sizes) => sizes.product, { cascade: true, eager: true })
    sizes: Sizes[];

    @OneToMany(() => Images, (images) => images.product, { cascade: true, eager: true })
    images: Images[];
}
