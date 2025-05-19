import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetArticlesQueryDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Filter by author name' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter articles published after this date' })
  @IsOptional()
  @IsDateString({}, { message: 'publishedAfter must be a valid date in YYYY-MM-DD format' })
  publishedAfter?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Filter articles published before this date' })
  @IsOptional()
  @IsDateString({}, { message: 'publishedBefore must be a valid date in YYYY-MM-DD format' })
  publishedBefore?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number for pagination (min: 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer number' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page (min: 1)', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer number' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10;
}
