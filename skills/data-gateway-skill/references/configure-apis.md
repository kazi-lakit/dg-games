# Configure APIs Reference — Data Gateway (UDS)

## 0. Get Bearer Token (do this first)

```
POST https://api.seliseblocks.com/idp/v1/Authentication/Token
x-blocks-key: <BLOCKS_KEY>
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=<CLIENT_ID>
client_secret=<CLIENT_SECRET>
```

Response → use `access_token` as Bearer token in all calls below.
Re-fetch on 401. All three values must come from `.env` — never hardcode.

---

All requests require these headers:
```
x-blocks-key: <BLOCKS_KEY from .env>
Authorization: Bearer <access_token from token endpoint>
Content-Type: application/json
```

---

## 1. Data Source

### Get Data Source
```
GET /uds/v1/data-sources/get?projectKey={projectKey}
```
Response `data` shape:
```json
{
  "dbConnectionString": "mongodb+srv://...",
  "databaseName": "my_db",
  "projectKey": "proj-123",
  "projectShortKey": "abc",
  "isActive": true,
  "itemId": "ds-uuid"
}
```
`projectShortKey` from this response is used for all `/gateway` and `/ping` calls.
**If `data` is null → not configured yet → call Add.**

### Add Data Source
```
POST /uds/v1/data-sources/add
```

**Always ask the user first:**
> "Do you have your own MongoDB connection string, or use the Blocks-provided database?"

#### Option A — Blocks-provided database (no MongoDB needed)
Use `"default"` for both fields. Blocks provisions and manages the database automatically.
```json
{
  "itemId": "<generate-a-uuid>",
  "connectionString": "default",
  "databaseName": "default",
  "projectKey": "proj-123"
}
```

#### Option B — User's own MongoDB
```json
{
  "itemId": "<generate-a-uuid>",
  "connectionString": "mongodb+srv://user:pass@host/db",
  "databaseName": "my_database",
  "projectKey": "proj-123"
}
```

### Update Data Source
```
PUT /uds/v1/data-sources/update
```
```json
{
  "itemId": "<existing-itemId>",
  "connectionString": "default",
  "databaseName": "default",
  "projectKey": "proj-123",
  "isActive": true
}
```
Use `"default"` for both fields to switch to Blocks-managed DB, or supply a real connection string for custom MongoDB.

---

## 2. Health & Deployment

### Check Gateway Health (Ping)
```
GET /uds/v1/{projectShortKey}/ping
```
- 200 OK → gateway is alive
- Error/timeout → gateway is down → trigger pipeline

### Trigger Deployment Pipeline
```
GET /uds/v1/deployment/pipeline?projectKey={projectKey}
```
Starts the gateway if not running. Wait a few seconds then retry ping.

### Reload GraphQL Configuration
```
POST /uds/v1/{projectShortKey}/configurations/reload?projectKey={projectKey}
```
Example:
```
POST https://api.seliseblocks.com/uds/v1/abc/configurations/reload?projectKey=D4745adc9f2564981aae2826bfc64ba79
```
- `projectShortKey` goes in the **path** (from data source GET response)
- `projectKey` goes as a **query parameter**
- ⚠️ MANDATORY after any schema, field, validation, or access change — without this, changes are NOT reflected in GraphQL

---

## 3. Schema Management

### Create Schema
```
POST /uds/v1/schemas/define
```

**Schema types:**
| schemaType | Int | Meaning |
|------------|-----|---------|
| Entity | 1 | Top-level schema — supports full GraphQL CRUD operations |
| Child  | 2 | Nested object only — used as a field type inside Entity schemas, no direct CRUD |

**Collection name rule:**
- Must start with `sb_` followed by the schema name in lowercase
- Example: schema `Product` → collectionName `sb_product`
- Example: schema `OrderItem` → collectionName `sb_orderitem`
- Child schemas are nested objects — they do NOT have their own collection

```json
{
  "schemaName": "Product",
  "collectionName": "sb_product",
  "projectKey": "proj-123",
  "projectShortKey": "abc",
  "schemaType": 1,
  "fields": [
    { "name": "name",        "type": "String",   "isArray": false },
    { "name": "price",       "type": "Float",    "isArray": false },
    { "name": "description", "type": "String",   "isArray": false },
    { "name": "inStock",     "type": "Boolean",  "isArray": false },
    { "name": "createdAt",   "type": "DateTime", "isArray": false },
    { "name": "tags",        "type": "String",   "isArray": true  }
  ]
}
```

Field `type` is a **string** (not an integer):
| String value | Use for |
|--------------|---------|
| `"String"`   | Text fields |
| `"Int"`      | Whole numbers |
| `"Long"`     | Large whole numbers |
| `"Float"`    | Decimal / price fields |
| `"Boolean"`  | true/false |
| `"DateTime"` | Date and time |

**Child schema example** (nested object, no collectionName needed):
```json
{
  "schemaName": "Address",
  "collectionName": "",
  "projectKey": "proj-123",
  "projectShortKey": "abc",
  "schemaType": 2,
  "fields": [
    { "name": "street",  "type": "String", "isArray": false },
    { "name": "city",    "type": "String", "isArray": false },
    { "name": "country", "type": "String", "isArray": false }
  ]
}
```

To use a Child schema as a field on an Entity, reference its schema name as the type:
```json
{ "name": "address", "type": "Address", "isArray": false }
```

Response `data.itemId` = the new schema's ID. **Save this for all subsequent calls.**

### Update Schema
```
PUT /uds/v1/schemas/info
```
```json
{
  "itemId": "<schema-id>",
  "schemaName": "Product",
  "collectionName": "sb_product",
  "projectKey": "proj-123",
  "schemaType": 1
}
```
Remember: collectionName must always be `sb_` + lowercase schema name.

### Add or Update Fields on a Schema
```
POST /uds/v1/schemas/fields
```
```json
{
  "itemId": "<schema-id>",
  "projectKey": "proj-123",
  "fields": [
    { "name": "sku",      "type": "String",  "isArray": false },
    { "name": "category", "type": "String",  "isArray": false },
    { "name": "quantity", "type": "Int",     "isArray": false },
    { "name": "price",    "type": "Float",   "isArray": false },
    { "name": "address",  "type": "Address", "isArray": false }
  ]
}
```
- `type` is always a **string**: `"String"`, `"Int"`, `"Long"`, `"Float"`, `"Boolean"`, `"DateTime"`
- To reference a Child schema as a nested field, use the Child schema name as the type (e.g. `"Address"`)
- `isArray: true` makes the field a list of that type
- Additive/upsert — safe to call repeatedly

### Get All Schemas (paginated)
```
GET /uds/v1/schemas?ProjectKey={projectKey}&PageNo=1&PageSize=20
```
Optional filters: `Keyword`, `SchemaName`, `CollectionName`, `SchemaType`

### Get Single Schema by ID
```
GET /uds/v1/schemas/get-by-id?id={schemaId}&projectKey={projectKey}
```

### Delete Schema
```
DELETE /uds/v1/schemas?id={schemaId}&projectKey={projectKey}
```
⚠️ Irreversible.

---

## 4. Validation Rules

### Add Validation to a Field
```
POST /uds/v1/data-validations
```
```json
{
  "projectKey": "proj-123",
  "schemaId": "<schema-id>",
  "fieldName": "email",
  "validations": [
    {
      "validationType": "Regex",
      "value": "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
      "errorMessage": "Must be a valid email address"
    }
  ]
}
```

⚠️ Only `"Regex"` validation type is supported. No other ValidationType values are accepted.

Each field can have one regex validation rule. The regex is checked on every create and update mutation.

### Update Validation
```
PUT /uds/v1/data-validations
```
Same body as create, plus `"itemId": "<validation-id>"` at top level.

### Get Validation for a Specific Field
```
GET /uds/v1/data-validations/by-schema-and-field?schemaId={schemaId}&fieldName={fieldName}&projectKey={projectKey}
```

### Get All Validations for a Schema
```
GET /uds/v1/data-validations/by-schema-id?schemaId={schemaId}&projectKey={projectKey}
```

### Delete Validation
```
DELETE /uds/v1/data-validations?validationId={validationId}&projectKey={projectKey}
```

---

## 5. Access Control

### Change Schema or Field Access Level
```
POST /uds/v1/data-access/security/change
```

All values are **integers**:

**operation** (PolicyOperation):
| Int | Meaning |
|-----|---------|
| 0   | READ — GraphQL queries |
| 1   | WRITE — create mutations |
| 2   | EDIT — update mutations |
| 3   | DELETE — delete mutations |

**policyType**:
| Int | Meaning |
|-----|---------|
| 0   | Schema-level — applies to the whole schema |
| 1   | Field-level — applies to specific fields only (set `fieldNames`) |

**accessLevel** (SchemaAccessLevel):
| Int | Meaning |
|-----|---------|
| 0   | Inherited — inherits from schema default (use for field-level reset) |
| 1   | User — logged-in users only (valid Bearer token required) |
| 2   | Public — no auth required, anyone can access |
| 3   | Custom — policy rules evaluated per request (must also create a policy) |

**`fieldNames` rules — IMPORTANT:**
- `fieldNames` must always contain **at least one item** — an empty array `[]` is not valid
- For **schema-level** (`policyType: 0`): put the **schema name** as the single item
- For **field-level** (`policyType: 1`): put the **field name(s)** to override
- For **policy/rule creation**: put the **schema name** as the single item

**Examples — exact payloads:**

Make READ public (schema-level):
```json
{
  "projectKey": "<projectKey>",
  "schemaId": "<schema-id>",
  "operation": 0,
  "policyType": 0,
  "fieldNames": ["Product"],
  "accessLevel": 2
}
```

Make READ logged-in users only (schema-level):
```json
{
  "projectKey": "<projectKey>",
  "schemaId": "<schema-id>",
  "operation": 0,
  "policyType": 0,
  "fieldNames": ["Product"],
  "accessLevel": 1
}
```

Make WRITE custom (schema-level — must follow up with a policy):
```json
{
  "projectKey": "<projectKey>",
  "schemaId": "<schema-id>",
  "operation": 1,
  "policyType": 0,
  "fieldNames": ["Product"],
  "accessLevel": 3
}
```

Make specific fields logged-in only (field-level override):
```json
{
  "projectKey": "<projectKey>",
  "schemaId": "<schema-id>",
  "operation": 0,
  "policyType": 1,
  "fieldNames": ["costPrice"],
  "accessLevel": 1
}
```

⚠️ For field-level: call this endpoint **once per field** if each field needs a different access level.
Call this endpoint **once per operation** (READ, WRITE, EDIT, DELETE) for schema-level changes.

### Create Custom Access Policy
```
POST /uds/v1/data-access/policy/create
```

**Top-level fields:**
- `policyName` — human-readable name
- `policyDescription` — description (e.g. "Generated from Rule Builder")
- `policyType` — integer: `0` = schema-level, `1` = field-level
- `operation` — integer: `0`=READ, `1`=WRITE, `2`=EDIT, `3`=DELETE
- `schemaName` — name of the schema (string)
- `schemaId` — UUID of the schema
- `fieldNames` — always `[]` for policy creation (rules target the whole schema or operation)
- `isAllowPolicy` — `true` = grant access if rules match, `false` = deny
- `priority` — integer, lower = evaluated first
- `projectKey` — project key
- `ruleGroup` — the rule logic (see below)

**Example 1 — Owner can edit their own records** (userId from token == CreatedBy field on record):
```json
{
  "policyName": "data creator or owner can edit",
  "policyDescription": "Generated from Rule Builder",
  "policyType": 0,
  "operation": 2,
  "schemaName": "Product",
  "schemaId": "<schema-id>",
  "fieldNames": [],
  "isAllowPolicy": true,
  "priority": 1,
  "projectKey": "<projectKey>",
  "ruleGroup": {
    "logicalOperator": 0,
    "rules": [
      {
        "leftSource": 0,
        "leftOperand": "userId",
        "operator": 0,
        "rightSource": 1,
        "rightOperand": "CreatedBy",
        "staticValue": null
      }
    ],
    "nestedGroups": []
  }
}
```

**Example 2 — Specific role can write** (roles claim from token contains static value):
```json
{
  "policyName": "super_admin can add item",
  "policyDescription": "Generated from Rule Builder",
  "policyType": 0,
  "operation": 1,
  "schemaName": "Product",
  "schemaId": "<schema-id>",
  "fieldNames": [],
  "isAllowPolicy": true,
  "priority": 1,
  "projectKey": "<projectKey>",
  "ruleGroup": {
    "logicalOperator": 0,
    "rules": [
      {
        "leftSource": 0,
        "leftOperand": "roles",
        "operator": 6,
        "rightSource": 2,
        "rightOperand": "",
        "staticValue": "super_admin"
      }
    ],
    "nestedGroups": []
  }
}
```

### Update Custom Policy
```
POST /uds/v1/data-access/policy/update
```
Same body as create, plus `"itemId": "<policy-id>"` at top level.

### Get Policies for a Schema
```
GET /uds/v1/data-access/policy/get?schemaName={schemaName}&projectKey={projectKey}
```

### Delete Policy
```
DELETE /uds/v1/data-access/policy/delete?itemId={policyId}&projectKey={projectKey}
```

---

## RuleGroup Structure

```json
{
  "logicalOperator": 0,
  "rules": [ ...one or more rule objects... ],
  "nestedGroups": [ ...nested ruleGroups for AND/OR combinations... ]
}
```

### logicalOperator (integer)
| Int | Meaning |
|-----|---------|
| 0   | AND — all rules must pass |
| 1   | OR — any rule must pass |

---

## Rule Object Structure

```json
{
  "leftSource": 0,
  "leftOperand": "<claim or field name>",
  "operator": 0,
  "rightSource": 1,
  "rightOperand": "<schema field name or empty>",
  "staticValue": null
}
```

### leftSource (integer) — where the LEFT value comes from
| Int | Source | Meaning |
|-----|--------|---------|
| 0   | AUTH   | JWT token claim (e.g. `userId`, `roles`, `email`, `tenantId`) |
| 1   | SCHEMA_FIELD | A field value from the record being accessed |
| 2   | STATIC_VALUE | A hardcoded literal value |

### rightSource (integer) — where the RIGHT value comes from
| Int | Source | Meaning |
|-----|--------|---------|
| 0   | AUTH   | JWT token claim |
| 1   | SCHEMA_FIELD | A field value from the record (e.g. `CreatedBy`, `ownerId`) |
| 2   | STATIC_VALUE | A hardcoded literal — put the value in `staticValue`, leave `rightOperand: ""` |

### operator (integer)
| Int | Meaning |
|-----|---------|
| 0   | EQUAL |
| 1   | NOT_EQUAL |
| 2   | GREATER_THAN |
| 3   | GREATER_THAN_OR_EQUAL |
| 4   | LESS_THAN |
| 5   | LESS_THAN_OR_EQUAL |
| 6   | CONTAIN |
| 7   | NOT_CONTAIN |
| 8   | IN |
| 9   | NOT_IN |
| 10  | START_WITH |
| 11  | END_WITH |
| 12  | IS_NULL |
| 13  | IS_NOT_NULL |
| 14  | REGEX |

### staticValue
- Use when `rightSource: 2` (STATIC_VALUE)
- Set to the literal string value (e.g. `"super_admin"`)
- Set to `null` when `rightSource` is AUTH or SCHEMA_FIELD

---

## Common Rule Patterns

**Token userId == record's CreatedBy field (owner check):**
```json
{ "leftSource": 0, "leftOperand": "userId", "operator": 0, "rightSource": 1, "rightOperand": "CreatedBy", "staticValue": null }
```

**Token roles contains "admin" (role check):**
```json
{ "leftSource": 0, "leftOperand": "roles", "operator": 6, "rightSource": 2, "rightOperand": "", "staticValue": "admin" }
```

**Token roles contains "tournament_manager" OR "admin" (multiple roles → use nestedGroups with OR):**
```json
{
  "logicalOperator": 1,
  "rules": [],
  "nestedGroups": [
    {
      "logicalOperator": 0,
      "rules": [{ "leftSource": 0, "leftOperand": "roles", "operator": 6, "rightSource": 2, "rightOperand": "", "staticValue": "admin" }],
      "nestedGroups": []
    },
    {
      "logicalOperator": 0,
      "rules": [{ "leftSource": 0, "leftOperand": "roles", "operator": 6, "rightSource": 2, "rightOperand": "", "staticValue": "tournament_manager" }],
      "nestedGroups": []
    }
  ]
}
```
