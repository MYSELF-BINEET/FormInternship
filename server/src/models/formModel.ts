import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './userModel';
import { FormElementsType } from '@form-builder/validation/src/types';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;  // Use the non-null assertion operator

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;  // Use the non-null assertion operator

  @Column({ type: 'jsonb', nullable: false })
  elements!: FormElementsType[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => User, (user:any) => user.forms, { nullable: false })
  user!: User;
}
