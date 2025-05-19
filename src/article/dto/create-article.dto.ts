import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'Understanding NestJS', description: 'Article title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A brief guide to building APIs with NestJS', description: 'Article description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Jane Smith', description: 'Name of the author' })
  @IsString()
  @IsNotEmpty()
  authorName: string;
}
