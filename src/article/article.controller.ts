import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
  } from '@nestjs/swagger';
  import { CreateArticleDto } from './dto/create-article.dto';
  import { UpdateArticleDto } from './dto/update-article.dto';
  import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
  import { ArticleService } from './article.service';
  import { JwtAuthGuard } from 'src/user-auth/jwt-auth.guard';
  
  @ApiTags('Articles')
  @Controller('articles')
  export class ArticleController {
    constructor(private readonly articlesService: ArticleService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new article' })
    @ApiResponse({ status: 201, description: 'Article successfully created' })
    async create(@Body() createArticleDto: CreateArticleDto) {
      return await this.articlesService.create(createArticleDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get a list of articles' })
    @ApiResponse({ status: 200, description: 'List of articles' })
    async findAll(@Query() query: GetArticlesQueryDto) {
      return await this.articlesService.findAll(query);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get article by ID' })
    @ApiParam({ name: 'id', description: 'UUID of the article', example: 'a3f1e35b-7e97-4f43-b0b3-19ff3275f9d1' })
    @ApiResponse({ status: 200, description: 'Article found' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await this.articlesService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing article' })
    @ApiParam({ name: 'id', description: 'UUID of the article to update', example: 'a3f1e35b-7e97-4f43-b0b3-19ff3275f9d1' })
    @ApiResponse({ status: 200, description: 'Article updated' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateArticleDto: UpdateArticleDto,
    ) {
      return await this.articlesService.update(id, updateArticleDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an article' })
    @ApiParam({ name: 'id', description: 'UUID of the article to delete', example: 'a3f1e35b-7e97-4f43-b0b3-19ff3275f9d1' })
    @ApiResponse({ status: 204, description: 'Article deleted' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
      await this.articlesService.remove(id);
    }
  }
  