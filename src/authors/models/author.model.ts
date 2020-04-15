import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';

@ObjectType()
export class Author {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name: string;

  // An author can have any number of posts including none
  // The posts field is only exposed to graphql but not implemented in the database
  // The ManyToOne relation is done by a foreign key on the Post model
  @Field(() => [Post], { nullable: 'items' })
  posts?: Post[];
}
