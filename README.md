# Alacena API

Backend NestJS para inventario, recetas, nutrición, notificaciones, escaneos y precios de tiendas.

Github: https://github.com/Francisc0Lozan0/tallerGraphQL.git

despliegue: https://tallergraphql-ks5t.onrender.com

## Requisitos

- Node.js 20 o superior
- PostgreSQL
- Variables de entorno configuradas para la base de datos y JWT

## Instalación

```bash
npm install
```

## Ejecutar la app

```bash
npm run start:dev
```

La API REST queda disponible en `/` y GraphQL en `/graphql`.

## Scripts

```bash
npm run start:dev
npm run start
npm run build
npm run lint
npm run test
npm run test:e2e
npm run seed
npm run migration:run
```

## GraphQL

El esquema se genera automáticamente en `src/schema.gql`.

### Autenticación

Usa el header:

```http
Authorization: Bearer <token>
```

### Roles

El backend maneja estos roles:

- `superadmin`
- `admin`
- `nutritionist`
- `user`

### Tipos principales expuestos

- `User`
- `Product`
- `InventoryItem`
- `Recipe`
- `RecipeIngredient`
- `RecipeStep`
- `Notification`
- `Store`
- `StorePrice`
- `NutritionTracker`
- `NutritionGoal`
- `NutritionProfileResponseDto`

### Queries útiles

```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
  }
}
```

```graphql
query Users {
  users {
    id
    email
    role
  }
}
```

```graphql
query InventoryItem($id: String!) {
  inventoryItem(id: $id) {
    id
    productName
    quantity
    product {
      id
      name
    }
    user {
      id
      email
    }
  }
}
```

```graphql
query Notifications {
  notifications {
    id
    title
    message
    isRead
    createdAt
  }
}
```

### Mutations útiles

```graphql
mutation CreateProduct($input: CreateProductDto!) {
  createProduct(input: $input) {
    id
    name
    unit
  }
}
```

```graphql
mutation CreateInventoryItem($input: CreateInventoryItemDto!) {
  createInventoryItem(input: $input) {
    id
    productName
    quantity
    product {
      id
      name
    }
    user {
      id
      email
    }
  }
}
```

```graphql
mutation PrepareRecipe($id: String!, $input: PrepareRecipeInput!) {
  prepareRecipe(id: $id, input: $input) {
    id
    name
  }
}
```

```graphql
mutation ConfirmScan($input: ConfirmScanInput!) {
  confirmScan(input: $input) {
    saved {
      id
      productName
      quantity
    }
  }
}
```

### StorePrices

```graphql
query Stores {
  stores {
    id
    name
    city
  }
}
```

```graphql
query StorePrice($storeId: String!, $productId: String!) {
  storePrice(storeId: $storeId, productId: $productId) {
    id
    price
    isAvailable
    store {
      id
      name
    }
    product {
      id
      name
    }
  }
}
```

## Pruebas

### Unitarias

```bash
npm run test
```

### E2E REST y GraphQL

```bash
npm run test:e2e
```

El suite e2e incluye pruebas REST en `test/app.e2e-spec.ts` y GraphQL en `test/graphql.e2e-spec.ts`.

## Notas de arquitectura

- GraphQL usa `@ObjectType`, `@InputType` y `@ResolveField` para exponer relaciones y evitar JSON genérico.
- Los errores de dominio se reportan con excepciones de NestJS para que Apollo los traduzca correctamente.
- `InventoryItem` resuelve `product` y `user`; `Recipe` resuelve `user`.

## Licencia

UNLICENSED
