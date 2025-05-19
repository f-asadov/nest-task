import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './article/article.module';
import { RedisOptions } from './config/redis';
import {config} from './config/typeorm'
import { AuthModule } from './user-auth/auth.module';



@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    CacheModule.registerAsync(RedisOptions),
    AuthModule,
    ArticleModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
