import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Loader } from 'nestjs-graphql-dataloader';
import { PostLoader } from '../posts/PostLoader';
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

  @ResolveField()
  async posts(@Parent() author: Author, @Loader(PostLoader) postLoader) {
    const { id } = author;
    console.log('AuthorsResolver posts id: ', id);
    const postsReturn = await postLoader.load(id);
    console.log('AuthorsResolver posts postsReturn: ', postsReturn);
    return postsReturn;
  }
}
