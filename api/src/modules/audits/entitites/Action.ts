// src/entities/Action.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Audit } from './Audit';
import { AuditDetail } from './AuditDetail';
import { ActionStatus } from './ActionStatus';
import { Plant } from '../../plants/enitites/plant.entities';
import { User } from '../../users/user.entity';


@Entity('actions')
export class Action {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Audit, (audit) => audit.actions)
  @JoinColumn({ name: 'auditId' })
  audit!: Audit;

  auditId!: number;

  @ManyToOne(() => AuditDetail, (detail) => detail.actions)
  @JoinColumn({ name: 'auditDetailId' })
  auditDetail!: AuditDetail;

  auditDetailId!: number;

  @ManyToOne(() => ActionStatus, (status) => status.actions)
  @JoinColumn({ name: 'statusId' })
  status!: ActionStatus;

  statusId!: number;

  // Real FK + denormalized display fields, same pattern as Audit.auditor*
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsibleUserId' })
  responsibleUser!: User | null;

  responsibleUserId!: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  responsibleLogin!: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  responsibleFullName!: string | null;

  @Column({ type: 'nvarchar', length: 200 })
  description!: string; // was "action" in the original doc — renamed to avoid
                        // clashing with the word "Action" (the entity itself)

  @Column({ type: 'date', nullable: true })
  plannedTerm!: Date | null;

  @Column({ type: 'date', nullable: true })
  term!: Date | null; // actual completion date

  @Column({ type: 'datetime2', nullable: true })
  lastEditDate!: Date | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  lastEditedByUser!: string | null; // was "user_action" — renamed for clarity

  @ManyToOne(() => Plant)
  @JoinColumn({ name: 'plantId' })
  plant!: Plant;

  plantId!: number;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  cause!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}