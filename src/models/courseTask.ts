import {
  Entity,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task';
import { Stage } from './stage';
import { Checker } from './checker';
import { TaskResult } from './taskResult';

@Entity()
export class CourseTask {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @ManyToOne(_ => Task, (task: Task) => task.courseTasks)
  task: Task | number;

  @OneToMany(_ => Checker, (checker: Checker) => checker.courseTaskId, { nullable: true })
  checker: Checker[] | null;

  @OneToMany(_ => TaskResult, (taskResult: TaskResult) => taskResult.courseTask, { nullable: true })
  taskResults: TaskResult[] | null;

  @ManyToOne(_ => Stage, (stage: Stage) => stage.courseTasks, { nullable: true })
  stage: Stage | number;

  @Column({ type: 'timestamp', nullable: true })
  studentStartDate: string;

  @Column({ type: 'timestamp', nullable: true })
  studentEndDate: string;

  @Column({ type: 'timestamp', nullable: true })
  mentorStartDate: string;

  @Column({ type: 'timestamp', nullable: true })
  mentorEndDate: string;

  @Column({ nullable: true })
  maxScore: number;

  @Column({ nullable: true, type: 'float', default: 1 })
  scoreWeight: number;
}
