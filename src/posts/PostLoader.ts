import { Injectable } from '@nestjs/common';
import { OrderedNestDataLoader } from 'nestjs-graphql-dataloader';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';

@Injectable()
export class PostLoader extends OrderedNestDataLoader<Post['id'], Post> {
  constructor(private readonly postsService: PostsService) {
    super();
  }

  protected getOptions = () => {
    return {
      query: (keys: Array<Post['id']>) => {
        console.log('PostLoader keys: ', keys);
        // gives an error:
        // "message": "Expected Iterable, but did not find one for field \"Author.posts\".",
        const posts = this.postsService.findByAuthorsIds(keys);

        // findByAuthorsIdsRamda return an ordered array of posts by authorID
        // But nestjs-graphql-dataloader give an error "message": "Post does not exist (1)",
        // in the ensureOrder function
        // const posts = this.postsService.findByAuthorsIdsRamda(keys);
        console.log('PostLoader posts: ', posts);
        return posts;
      },
    };
  };
}
