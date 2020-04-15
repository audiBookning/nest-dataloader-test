import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { Loader } from 'nestjs-graphql-dataloader';
import { AuthorLoader } from '../authors/AuthorLoader';
import { Author } from '../authors/models/author.model';
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

  @ResolveField()
  async author(
    @Parent() post: Post,
    @Loader(AuthorLoader) authorLoader: DataLoader<Author['id'], Author>,
  ) {
    const { authorId } = post;
    if (!authorId) {
      return null;
    }
    console.log('PostsResolver author authorId: ', authorId);
    const authorReturn = await authorLoader.load(authorId);
    console.log('PostsResolver author authorReturn: ', authorReturn);
    return authorReturn;
  }
}
