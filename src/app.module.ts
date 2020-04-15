import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { DataLoaderInterceptor } from 'nestjs-graphql-dataloader';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorLoader } from './authors/AuthorLoader';
import { AuthorsResolver } from './authors/authors.resolver';
import { AuthorsService } from './authors/authors.service';
import { PostLoader } from './posts/PostLoader';
import { PostsResolver } from './posts/posts.resolver';
import { PostsService } from './posts/posts.service';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthorsResolver,
    PostsResolver,
    AuthorsService,
    PostsService,
    PostLoader,
    AuthorLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class AppModule {}
