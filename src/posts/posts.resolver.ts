import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { AuthorLoader } from '../authors/AuthorLoader';
import { Author } from '../authors/models/author.model';
import { Loader } from '../nestjs-graphql-dataloader';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query(() => [Post])
  findAllPosts() {
    return this.postsService.findAll();
  }

  @Query(() => Post)
  findPostById(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.findOneById(id);
  }

  @ResolveField(() => Author)
  author(
    @Parent() { authorId }: Post,
    @Loader(AuthorLoader) authorLoader: DataLoader<Author['id'], Author>,
  ) {
    if (!authorId) {
      return null;
    }
    return authorLoader.load(authorId);
  }
}
