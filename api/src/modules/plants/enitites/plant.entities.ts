import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Audit } from '../../audits/entitites/Audit';
import { Schedule } from '../../audits/entitites/Schedule';
import { User } from '../../users/user.entity';

@Entity('plants')
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  family!: 'FMS' | 'A&D';

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  designation!: string; // FMS1, FMS2, A&D1, A&D2

  @OneToMany(() => User, (user) => user.plant)
  users!: User[];

  @OneToMany(() => Audit, (audit) => audit.plant)
  audits!: Audit[];

  @OneToMany(() => Schedule, (schedule) => schedule.plant)
  schedules!: Schedule[];
}