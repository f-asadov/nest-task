import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 }) 
  title: string;

  @Column('text')
  description: string;

  @CreateDateColumn({ name: 'published_at' })
  publishedAt: Date;

  @Column({ type: 'varchar', length: 100 }) 
  authorName: string;
}

