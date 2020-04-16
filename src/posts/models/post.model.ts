import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Author } from '../../authors/models/author.model';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title?: string;

  // OneToMany relation exposed to graphql
  @Field(() => Author)
  author?: Author;

  // foreign key implementing the OneToMany relation, but not exposed to graphql
  authorId: number;
}
