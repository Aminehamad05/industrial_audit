// src/entities/Schedule.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Plant } from '../../plants/enitites/plant.entities';
import { User } from '../../users/user.entity';
import { Audit } from './Audit';

export enum ScheduleStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 200 })
  scheduleName!: string;

  @Column({ type: 'nvarchar', length: 200 })
  auditType!: string;

  @Column({ type: 'nvarchar', length: 200 })
  auditTarget!: string;

  @Column({ type: 'date' })
  auditDate!: Date;

  @Column('int')
  auditYear!: number;

  @Column('int')
  auditMonth!: number;

  @Column('int')
  auditWeek!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditorId' })
  auditor!: User;

  auditorId!: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  auditTargetArea!: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  auditTargetSubarea!: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  section!: string | null;

  @ManyToOne(() => Plant, (plant) => plant.schedules)
  @JoinColumn({ name: 'plantId' })
  plant!: Plant;

  @Column('int')
  plantId!: number;

  @Column({ type: 'nvarchar', length: 20, default: ScheduleStatus.PLANNED })
  status!: ScheduleStatus;

  @OneToMany(() => Audit, (audit) => audit.schedule)
  audits!: Audit[];
}