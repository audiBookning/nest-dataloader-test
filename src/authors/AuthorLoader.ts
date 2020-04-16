import { Injectable } from '@nestjs/common';
import { OrderedNestDataLoader } from '../nestjs-graphql-dataloader';
import { AuthorsService } from './authors.service';
import { Author } from './models/author.model';

@Injectable()
export class AuthorLoader extends OrderedNestDataLoader<Author['id'], Author> {
  constructor(private readonly authorsService: AuthorsService) {
    super();
  }

  protected getOptions = () => {
    return {
      query: (keys: Array<Author['id']>) => {
        return this.authorsService.findAllByIds(keys);
      },
    };
  };
}
