import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,JoinColumn,ManyToOne } from "typeorm";
import type { Role } from "../../shared/types/auth";
import type { AccountStatus } from "../../shared/types/auth";
import {Plant} from "../plants/enitites/plant.entities"
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 64, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 254, unique: true })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ name: "full_name", type: "varchar", length: 128 })
  fullName!: string;
  

  @Column({ type: "varchar", length: 32 })
  role!: Role;

  @ManyToOne(() => Plant, plant => plant.users, {
  nullable: true,
  })

  @JoinColumn({ name: "plant_id" })
  plant!: Plant | null;

  @Column({ name: "account_status", type: "varchar", length: 16, default: "Pending" })
  accountStatus!: AccountStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}