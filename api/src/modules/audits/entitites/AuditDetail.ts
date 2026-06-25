// src/entities/AuditDetail.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Audit } from './Audit';
import { Plant } from '../../plants/enitites/plant.entities';
import { Action } from './Action';

@Entity('audit_details')
export class AuditDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Audit, (audit) => audit.details)
  @JoinColumn({ name: 'auditId' })
  audit!: Audit;

  auditId!: number;

  @Column('int')
  groupPosition!: number;

  @Column({ type: 'nvarchar', length: 100 })
  groupName!: string;

  @Column({ type: 'nvarchar', length: 100 })
  groupNameEng!: string;

  @Column('int')
  questionPosition!: number;

  @Column({ type: 'nvarchar', length: 800 })
  question!: string;

  @Column({ type: 'nvarchar', length: 800 })
  questionEng!: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  answer!: string | null; // raw/free-text answer value, kept alongside the flags below

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  comment!: string | null;

  // Kept as four separate booleans per your mentor's real process — not
  // collapsed into one enum. Application/service layer is responsible for
  // ensuring these stay mutually exclusive (at most one true at a time);
  // the DB does not enforce that itself.
  @Column({ type: 'bit', default: false })
  answerOk!: boolean;

  @Column({ type: 'bit', default: false })
  answerNok!: boolean;

  @Column({ type: 'bit', default: false })
  answerNc!: boolean;

  @Column({ type: 'bit', default: false })
  answerNa!: boolean;

  @ManyToOne(() => Plant)
  @JoinColumn({ name: 'plantId' })
  plant!: Plant;

  plantId!: number;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  photoPath!: string | null;

  @OneToMany(() => Action, (action) => action.auditDetail)
  actions!: Action[];
}