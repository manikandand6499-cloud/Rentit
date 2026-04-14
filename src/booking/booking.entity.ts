// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// @Entity()
// export class Booking {
//   @PrimaryGeneratedColumn()
//   id: number | undefined;

//   @Column()
//   name: string | undefined;

//   @Column()
//   mobile: string | undefined;

//   @Column()
//   houseName: string | undefined;

//   @Column()
//   location: string | undefined;

//   @Column()
//   time: string | undefined; // example: "5:30 PM"

//   @Column({ default: 'pending' })
//   status: string | undefined; // pending | confirmed | cancelled | calling

//   @Column({ default: false })
//   verified: boolean | undefined;

//   @Column({ default: 'en' })
//   language: string | undefined; // en | ta | hi | te | kn
// }