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

## Query

````

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
````
