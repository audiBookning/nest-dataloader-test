import { Injectable } from '@nestjs/common';
import { groupBy, map } from 'ramda';
import { PostMock } from '../mock/mock';
import { Post } from './models/post.model';

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
    return this.postList.filter(post => keys.some(el => el === post.authorId));
  }

  findByAuthorsIdsRamda(keys: number[]) {
    const posts = this.postList.filter(post =>
      keys.some(el => el === post.authorId),
    );
    const groupedById = groupBy(post => post.authorId, posts);
    return map(key => groupedById[key], keys);
  }
}
