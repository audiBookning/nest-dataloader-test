# nestjs-graphql-dataloader Test

Trying to implement [nestjs-graphql-dataloader](https://github.com/TreeMan360/nestjs-graphql-dataloader)

## Development start script

npm run start:dev

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

## Query with error

Error:

```
"message": "Expected Iterable, but did not find one for field \"Author.posts\".",
```

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

## Order the posts by author id

Used Ramda as an alternative to order the posts by author id.
The function that implements it is findByAuthorsIdsRamda in PostsService and should be called in PostLoader
But Graphql gives an error:

```
give an error "message": "Post does not exist (1)",
```

## Note

The services should return promises for type consistency with the loaders, but it doesn't seem to be relevant for this error.
