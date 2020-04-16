import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { Loader } from '../nestjs-graphql-dataloader';
import { Post } from '../posts/models/post.model';
import { PostOrderedLoader } from '../posts/PostOrderedLoader';
import { AuthorsService } from './authors.service';
import { Author } from './models/author.model';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(private authorsService: AuthorsService) {}

  @Query(() => [Author])
  findAllAuthors() {
    return this.authorsService.findAll();
  }

  @Query(() => Author)
  findAuthorById(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField(() => Post)
  posts(
    @Parent() { id }: Author,
    @Loader(PostOrderedLoader) postLoader: DataLoader<Post['id'], Post>,
  ) {
    return postLoader.load(id);
  }
}
