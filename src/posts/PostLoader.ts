import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { NestDataLoader } from '../nestjs-graphql-dataloader';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';

@Injectable()
export class PostLoader implements NestDataLoader<Post['id'], Post> {
  constructor(private readonly postsService: PostsService) {}

  public generateDataLoader(): DataLoader<number, Post> {
    return new DataLoader<number, Post>(keys => {
      return this.postsService.findByAuthorsIdsRamda(keys);
    });
  }
}
