import { Injectable } from '@nestjs/common';
import {
  OrderedNestDataLoader,
  ReturnType,
} from '../nestjs-graphql-dataloader';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';

@Injectable()
export class PostOrderedLoader extends OrderedNestDataLoader<Post['id'], Post> {
  constructor(private readonly postsService: PostsService) {
    super();
  }

  protected getOptions = () => {
    return {
      query: (keys: Array<Post['id']>) => {
        return this.postsService.findByAuthorsIds(keys);
      },
      returnType: ReturnType.Array,
      propertyKey: 'authorId',
    };
  };
}
