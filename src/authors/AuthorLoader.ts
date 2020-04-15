import { Injectable } from '@nestjs/common';
import { OrderedNestDataLoader } from 'nestjs-graphql-dataloader';
import { AuthorsService } from './authors.service';
import { Author } from './models/author.model';

@Injectable()
export class AuthorLoader extends OrderedNestDataLoader<Author['id'], Author> {
  constructor(private readonly authorsService: AuthorsService) {
    super();
  }

  protected getOptions = () => {
    return {
      query: keys => {
        console.log('AuthorLoader keys: ', keys);
        const authors = this.authorsService.findAllByIds(keys);
        console.log('PostLoader authors: ', authors);
        return authors;
      },
    };
  };
}
