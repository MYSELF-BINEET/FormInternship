import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Form } from './formModel';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  // @ManyToOne(() => Form, (form) => form._id, { nullable: false })
  // form!: Form;

  @ManyToOne(() => Form, (form) => form._id, { onDelete: 'CASCADE' })
  form!: Form;


  @Column({
    type: 'jsonb',
    nullable: false,
  })
  response!: {
    elementType: string;
    question: string;
    answer: any;
  }[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
