# Test

Repo with a temporary hack for using Dataloader.load in [nestjs-graphql-dataloader](https://github.com/TreeMan360/nestjs-graphql-dataloader) for SQL OneToMany relationships.

Related Issue: [Empty array in field return an error](https://github.com/TreeMan360/nestjs-graphql-dataloader/issues/2#issuecomment-614276632)

## Development start script

npm run start:dev

## PostLoader

- not a hack
- not used in the code

PostLoader use generateDataLoader() directly by implementing NestDataLoader and bypassing ensureOrder. The ordering will have to be done on the Loader.

## PostOrderedLoader

- a hack

Used in AuthorsResolver in the @ResolveField(() => Post)

- Uses propertyKey to pass the 'authorId'.
- Uses returnType to indicate the type of ordering to implement.
- ReturnType is an enum. A simple string might be better?

```typescript
protected getOptions = () => {
    return {
      query: (keys: Array<Post['id']>) => {
        return this.postsService.findByAuthorsIds(keys);
      },
      returnType: ReturnType.Array,
      propertyKey: 'authorId',
    };
  };
```

## Entities

Used a simple mock array instead of a database

```graphql
Author: {
  id: number
  name: string
}
```

```graphql
Post: {
  id: number
  title: string
  authorId: number
}
```

Post.authorId is a foreign key that implements a OneToMany relationship

## GraphQl Types

```graphql
type Author {
  id: Int!
  name: String
  posts: [Post]!
}
```

```graphql
type Post {
  id: Int!
  title: String!
  author: Author!
}
```

## Query

```graphql
{
  findAllAuthors {
    id
    name
    posts {
      id
      title
    }
  }
}
```
