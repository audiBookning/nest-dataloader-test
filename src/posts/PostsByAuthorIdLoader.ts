import { Injectable } from '@nestjs/common';
import { OrderedArrayOfArrayDataLoader } from '../nestjs-graphql-dataloader';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';

@Injectable()
export class PostsByAuthorIdLoader extends OrderedArrayOfArrayDataLoader<
  Post['id'],
  Post
> {
  constructor(private readonly postsService: PostsService) {
    super();
  }

  protected getOptions = () => {
    return {
      query: (keys: Array<Post['id']>) => {
        return this.postsService.findByAuthorsIds(keys);
      },
      propertyKey: 'authorId',
    };
  };
}
