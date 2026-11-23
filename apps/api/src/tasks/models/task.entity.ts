import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity.js';

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETE = 'complete',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    name: 'status',
  })
  status!: TaskStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User> | null;
}
