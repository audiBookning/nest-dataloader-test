import { Injectable } from '@nestjs/common';
import { groupBy, map } from 'ramda';
import { PostMock } from '../mock/mock';
import { Post } from './models/post.model';

function groupByJS(xs: any[], f) {
  return xs.reduce(
    (previousValue, currentValue, currentIndex, array, k = f(currentValue)) => (
      (previousValue[k] || (previousValue[k] = [])).push(currentValue),
      previousValue
    ),
    {},
  );
}

@Injectable()
export class PostsService {
  postList: Post[];
  constructor() {
    this.postList = PostMock;
  }
  findAll() {
    return this.postList;
  }

  findOneById(id: number) {
    return this.postList.find(a => a.id === id);
  }

  findAllByAuthor(authorId: number) {
    return this.postList.filter(p => p.authorId === authorId);
  }

  findByAuthorsIds(keys: number[]) {
    return Promise.resolve(
      this.postList.filter(post => keys.some(el => el === post.authorId)),
    );
  }

  findByAuthorsIdsJS(keys: readonly number[]) {
    const posts = this.postList.filter(post =>
      keys.some(el => el === post.authorId),
    );
    const groupedById = groupByJS(posts, post => post.authorId);
    const orderedAuthors = keys.map(key => groupedById[key]);
    return Promise.resolve(orderedAuthors);
  }

  findByAuthorsIdsRamda(keys: readonly number[]) {
    const posts = this.postList.filter(post =>
      keys.some(el => el === post.authorId),
    );
    const groupedById = groupBy(post => post.authorId, posts);
    const orderedAuthors = map(key => groupedById[key] || [], keys);
    return Promise.resolve(orderedAuthors);
  }
}
