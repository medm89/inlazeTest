import { Role } from 'src/role/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  full_name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('numeric', { default: 1 })
  phone: number;

  @Column('numeric')
  role: number;

  @Column('boolean', { default: false })
  is_deleted: boolean;

  @Column('date')
  created_at: Date;

  @Column('date')
  updated_at: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role' })
  roles: Role;

  @BeforeInsert()
  setCreationDate() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }
  
  @BeforeInsert()
  checkFields(){
    this.email = this.email.toLowerCase().trim();
    this.full_name = this.full_name.toUpperCase();

  }

  @BeforeUpdate()
  setUpdateDate() {
    this.updated_at = new Date();
  }

  softDelete() {
    this.is_deleted = true;
    this.setUpdateDate();
  }
}
