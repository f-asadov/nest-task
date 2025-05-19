import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from 'src/entities/article.entity';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import objectHash = require('object-hash');


@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);
    const saved = await this.articleRepository.save(article);
    await this.invalidateAllCache();
    return saved;
  }

  async findAll(query: GetArticlesQueryDto) {
    const cacheKey = `articles:${objectHash(query)}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const {
      authorName,
      publishedAfter,
      publishedBefore,
      page = 1,
      limit = 10,
    } = query;

    const where: FindOptionsWhere<Article> = {};

    if (authorName) {
      where.authorName = ILike(`%${authorName}%`);
    }

    if (publishedAfter && publishedBefore) {
      where.publishedAt = Between(
        new Date(publishedAfter),
        new Date(publishedBefore),
      );
    } else if (publishedAfter) {
      where.publishedAt = MoreThanOrEqual(new Date(publishedAfter));
    } else if (publishedBefore) {
      where.publishedAt = LessThanOrEqual(new Date(publishedBefore));
    }

    const [data, total] = await this.articleRepository.findAndCount({
      where,
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = { data, total };

    // Infinity cache
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async findOne(id: string): Promise<Article> {
    const cacheKey = `article:${id}`;
    const cached = await this.cacheManager.get<Article>(cacheKey);
    if (cached) {
      return cached;
    }

    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, article);
    return article;
  }

  async update(id: string, updateDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);
    const updated = Object.assign(article, updateDto);
    const saved = await this.articleRepository.save(updated);
    await this.invalidateCache(id);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string) {
    await this.cacheManager.del(`article:${id}`);
    await this.invalidateAllCache();
  }

  private async invalidateAllCache() {
    
    const redis = (this.cacheManager as any).store?.getClient?.();
    if (redis && typeof redis.keys === 'function') {
      const keys = await redis.keys('articles:*');
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      await this.cacheManager.clear();
    }
  }
}
