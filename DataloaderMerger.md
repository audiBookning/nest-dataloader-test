# Dataloader as a merge queries tool

## Classic Dataloader batching

Dataloader.load()

```js
const user1 = await userLoader.load(1);
const user2 = await userLoader.load(2);
```

Batch Function

```js
async function batchFunction(keys) {
  const results = await db.fetchAllKeys(keys);
  return keys.map(key => results[key] || new Error(`No result for ${key}`));
}
```

Example with field level resolver

```js
const typeDefs = `
type QuestionType {
  id: String,
}

type LectureType {
  id: String,
  questions: [QuestionType],
}
# And the rest of your schema...`;

const resolvers = {
  LectureType: {
    questions: ({ _id }, args, { models }) => {
      const parentId = _id;
      return questionLoader.load(parentId);
    },
  },
  Query: {
    // your queries...
  },
  // Mutations or other types you need field resolvers for
};
```

## Query Dataloader

```js
// Parent resolver
// serialize the field and its parent info into an id
const Identifier = entity.type + '_' + parent.type + '_' + parent.id;
const LectureType = await LectureTypeLoader.load(Identifier);

// Field resolver
const Identifier = entity.type + '_' + parent.type + '_' + parent.id;
const questions = await LectureTypeLoader.load(Identifier);
```

Batch function

```js
async function batchFunction(Identifiers) {
  // deserialize the Identifier array to objects/tokens
  // create a query tree by ordering the keys in a tree by the parent.id and group the child keys by entity.type
  // parse the query tree to a database query
}
```
