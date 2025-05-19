import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArticleService } from './article.service';


const mockArticle = {
  id: 'uuid-1234',
  title: 'Test Title',
  description: 'Test Description',
  authorName: 'Author',
  publishedAt: new Date(),
};

const mockRepo = {
  create: vi.fn(),
  save: vi.fn(),
  findAndCount: vi.fn(),
  findOne: vi.fn(),
  remove: vi.fn(),
};

const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  clear: vi.fn(),
};


describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ArticleService(
      mockRepo as any,
      mockCache as any,
    );
  });

  describe('create', () => {
    it('should create and save article', async () => {
      mockRepo.create.mockReturnValue(mockArticle);
      mockRepo.save.mockResolvedValue(mockArticle);

      const result = await service.create(mockArticle);

      expect(mockRepo.create).toHaveBeenCalledWith(mockArticle);
      expect(mockRepo.save).toHaveBeenCalledWith(mockArticle);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findAll', () => {
    it('should return cached data if present', async () => {
      const query = { page: 1, limit: 10 };
      const cached = { data: [mockArticle], total: 1 };
      mockCache.get.mockResolvedValue(cached);

      const result = await service.findAll(query);

      expect(mockCache.get).toHaveBeenCalled();
      expect(result).toEqual(cached);
      expect(mockRepo.findAndCount).not.toHaveBeenCalled();
    });

    it('should query repo and cache result if no cache', async () => {
      const query = { page: 1, limit: 10 };
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAndCount.mockResolvedValue([[mockArticle], 1]);
      mockCache.set.mockResolvedValue(undefined);

      const result = await service.findAll(query);

      expect(mockCache.get).toHaveBeenCalled();
      expect(mockRepo.findAndCount).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalled();
      expect(result).toEqual({ data: [mockArticle], total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return cached article if present', async () => {
      mockCache.get.mockResolvedValue(mockArticle);

      const result = await service.findOne(mockArticle.id);

      expect(mockCache.get).toHaveBeenCalledWith(`article:${mockArticle.id}`);
      expect(result).toEqual(mockArticle);
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw if article not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockArticle.id)).rejects.toThrow();
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: mockArticle.id } });
    });

    it('should fetch from repo and cache if no cache', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(mockArticle);
      mockCache.set.mockResolvedValue(undefined);

      const result = await service.findOne(mockArticle.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: mockArticle.id } });
      expect(mockCache.set).toHaveBeenCalledWith(`article:${mockArticle.id}`, mockArticle);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should update article and invalidate cache', async () => {
      const updateDto = { title: 'New title' };
      mockRepo.findOne.mockResolvedValue(mockArticle);
      mockRepo.save.mockResolvedValue({ ...mockArticle, ...updateDto });
      mockCache.del.mockResolvedValue(undefined);

      const result = await service.update(mockArticle.id, updateDto);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: mockArticle.id } });
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(mockCache.del).toHaveBeenCalledWith(`article:${mockArticle.id}`);
      expect(result.title).toBe('New title');
    });

    it('should throw if article not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.update(mockArticle.id, { title: 'x' })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove article and invalidate cache', async () => {
      mockRepo.findOne.mockResolvedValue(mockArticle);
      mockRepo.remove.mockResolvedValue(undefined);
      mockCache.del.mockResolvedValue(undefined);

      await service.remove(mockArticle.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: mockArticle.id } });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockArticle);
      expect(mockCache.del).toHaveBeenCalledWith(`article:${mockArticle.id}`);
    });

    it('should throw if article not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(mockArticle.id)).rejects.toThrow();
    });
  });
});
