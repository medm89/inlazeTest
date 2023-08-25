import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column('text')
  name: string;

  @Column('boolean', { default: false })
  is_deleted: boolean;

  @Column('date')
  created_at: Date;

  @Column('date')
  updated_at: Date;

  @BeforeInsert()
  setCreationDate() {
    this.created_at = new Date();
    this.updated_at = new Date();
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
