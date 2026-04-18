// message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column()
  sender_id: string | undefined;

  @Column()
  receiver_id: string | undefined;

  @Column()
  property_id: number | undefined;

  @Column()
  message: string | undefined;

  @CreateDateColumn()
  created_at: Date | undefined;
}