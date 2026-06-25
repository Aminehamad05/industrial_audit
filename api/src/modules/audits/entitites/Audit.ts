// src/entities/Audit.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Plant } from '../../plants/enitites/plant.entities';
import { User } from '../../users/user.entity';
import { Schedule } from './Schedule';
import { AuditDetail } from './AuditDetail';
import { Action } from './Action';

@Entity('audits')
export class Audit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100 })
  auditType!: string; // code

  @Column({ type: 'nvarchar', length: 200 })
  auditTypeName!: string; // human-readable

  @Column({ type: 'nvarchar', length: 100 })
  auditTarget!: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  auditTargetArea!: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  auditTargetSubarea!: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  auditTargetSection!: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  auditShiftName!: string | null;

  // --- Auditor: real FK + denormalized display fields kept in sync by the service layer ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'auditorId' })
  auditor!: User;

  auditorId!: string;

  @Column({ type: 'nvarchar', length: 50 })
  auditorLogin!: string;

  @Column({ type: 'nvarchar', length: 100 })
  auditorFullName!: string;

  // --- Supervisor: same pattern ---
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor!: User | null;

  supervisorId!: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  supervisorName!: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  supervisorLogin!: string | null;

  @Column({ type: 'datetime2' })
  startDate!: Date;

  @Column({ type: 'datetime2', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score!: number | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  comment!: string | null;

  @ManyToOne(() => Plant, (plant) => plant.audits)
  @JoinColumn({ name: 'plantId' })
  plant!: Plant;

  plantId!: number;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  matricule!: string | null;

  @ManyToOne(() => Schedule, (schedule) => schedule.audits, { nullable: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule!: Schedule | null;

  scheduleId!: number | null;

  @OneToMany(() => AuditDetail, (detail) => detail.audit)
  details!: AuditDetail[];

  @OneToMany(() => Action, (action) => action.audit)
  actions!: Action[];
}