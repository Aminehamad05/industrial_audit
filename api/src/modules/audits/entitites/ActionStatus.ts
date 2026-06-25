// src/entities/ActionStatus.ts
// Mirrors setts_action_status. Treated as a reference/lookup table — seeded
// once, rarely written to after. Kept as a real table (not a TS enum) since
// your mentor's schema models it as DB-driven, which means new statuses can
// be added without a code deploy.
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Action } from './Action';

@Entity('action_statuses')
export class ActionStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100 })
  label!: string; // e.g. "Open", "In Progress", "Closed"

  @OneToMany(() => Action, (action) => action.status)
  actions!: Action[];
}