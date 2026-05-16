# Consume (GraphQL Gateway) Reference — Data Gateway (UDS)

After schemas are configured and published, the GraphQL gateway is the runtime interface
for all CRUD operations.

---

## Gateway Endpoint

```
POST /uds/v1/{projectShortKey}/gateway
Content-Type: application/json
x-blocks-key: <blocks-key>
Authorization: Bearer <token>     ← required if any operation is loggedInUser or custom
```

Body:
```json
{
  "query": "...",
  "variables": { }
}
```

`projectShortKey` comes from `GET /uds/v1/data-sources/get` → `data.projectShortKey`

---

## Introspection

Use introspection to discover available types and operations for a project:

```graphql
query {
  __schema {
    queryType { fields { name description args { name type { name kind } } } }
    mutationType { fields { name description args { name type { name kind } } } }
    types { name kind fields { name type { name kind } } }
  }
}
```

Or fetch a specific type:
```graphql
query {
  __type(name: "Product") {
    name
    fields {
      name
      type { name kind ofType { name kind } }
    }
  }
}
```

---

## Auto-Generated Operations

For each published schema (e.g. `Product`), Data Gateway auto-generates:

| Operation | GraphQL name | Type |
|-----------|-------------|------|
| Get single | `product(id: ID!)` | Query |
| List/filter | `products(filter: ..., sort: ..., pagination: ...)` | Query |
| Create | `createProduct(input: ProductInput!)` | Mutation |
| Update | `updateProduct(id: ID!, input: ProductInput!)` | Mutation |
| Delete | `deleteProduct(id: ID!)` | Mutation |

The naming convention: schema name `Product` → query `product` / `products`, mutation prefix `create/update/delete` + schema name.

---

## Query Examples (Product schema with name, price, description, sku)

### Get single record
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    price
    description
    sku
  }
}
```
Variables: `{ "id": "abc123" }`

### List all records
```graphql
query ListProducts {
  products {
    items {
      id
      name
      price
      sku
    }
    totalCount
  }
}
```

### List with filter
```graphql
query FilterProducts($filter: ProductFilterInput) {
  products(filter: $filter) {
    items { id name price }
    totalCount
  }
}
```
Variables:
```json
{ "filter": { "price": { "gte": 10.0 }, "name": { "contains": "widget" } } }
```

### List with sort and pagination
```graphql
query {
  products(
    sort: { field: "price", isDescending: true }
    pagination: { pageNo: 1, pageSize: 10 }
  ) {
    items { id name price }
    totalCount
  }
}
```

---

## Mutation Examples

### Create record
```graphql
mutation CreateProduct($input: ProductInput!) {
  createProduct(input: $input) {
    id
    name
    price
  }
}
```
Variables:
```json
{
  "input": {
    "name": "Widget Pro",
    "price": 49.99,
    "description": "A great widget",
    "sku": "WD-0042"
  }
}
```
Validation rules (regex) are enforced at this point. Fails with 400 if pattern doesn't match.

### Update record
```graphql
mutation UpdateProduct($id: ID!, $input: ProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    name
    price
  }
}
```
Variables:
```json
{ "id": "abc123", "input": { "price": 39.99 } }
```

### Delete record
```graphql
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id) {
    acknowledged
    itemId
  }
}
```
Variables: `{ "id": "abc123" }`

---

## Authorization Behavior at Runtime

| Schema access level | What happens at gateway |
|--------------------|------------------------|
| `Public` | Request passes with no token |
| `LoggedInUser` | Gateway validates Bearer token; 401 if missing/invalid |
| `Custom` | Gateway evaluates policy rules against token claims; 403 if denied |

Field-level access: if a field is restricted and the caller lacks access, that field is
omitted from the response (not an error — it's simply null/absent).

---

## Common Runtime Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token missing or invalid | Pass valid `Authorization: Bearer <token>` |
| 403 Forbidden | Custom policy rule denied access | Check role/claim in token vs policy rules |
| 400 Validation Error | Regex validation failed on a field | Check the field value matches the configured pattern |
| Field returns null unexpectedly | Field-level access restriction | Verify caller's token has required access for that field |
| Schema not found in gateway | Changes not reloaded | Call `POST /uds/v1/configurations/reload` |
| Gateway timeout | Service not running | Ping, then trigger deployment pipeline |
