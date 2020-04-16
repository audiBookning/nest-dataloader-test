# Test

Repo with a temporary hack for using Dataloader.load in [nestjs-graphql-dataloader](https://github.com/TreeMan360/nestjs-graphql-dataloader) for SQL OneToMany relationships. With the objective to understand the use of Dataloader and also its use in NestJs.

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

- Extends a new loader type: OrderedArrayOfArrayDataLoader

```typescript
  class PostsByAuthorIdLoader extends OrderedArrayOfArrayDataLoader
```

- Uses propertyKey to pass the 'authorId'.

```typescript
protected getOptions = () => {
    return {
      query: (keys: Array<Post['id']>) => {
        return this.postsService.findByAuthorsIds(keys);
      },
      propertyKey: 'authorId',
    };
  };
```

The OrderedNestDataLoader has been changed to OrderedArrayOfObjectDataLoader.

## Notes

The best solution would still probably be to have only one loader type.

As commented by nestjs-graphql-dataloader's maintainer in the above mentioned issue, it should be considered the strategy of a simple join in the parent to get the array of ids of the relation. Some performance tests should be done. And those might be heavily influenced by the Data design and its complexity together with its exposure to graphql.

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
