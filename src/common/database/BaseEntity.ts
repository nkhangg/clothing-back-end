import { Exclude, plainToClass } from 'class-transformer';
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    @Exclude()
    updatedAt: Date;

    @Exclude()
    @Column({ default: null, name: 'deleted_at' })
    deletedAt: Date | null;

    static plainToInStance<T>(this: new (...args: any[]) => T, obj: T): T {
        return plainToClass(this, obj, { exposeDefaultValues: true });
    }
}
