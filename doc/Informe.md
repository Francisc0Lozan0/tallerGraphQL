# Informe API - Gestion Alimentaria Inteligente

## Resumen
Este informe describe la API backend desarrollada con NestJS para la gestion alimentaria. Incluye autenticacion JWT, autorizacion por roles, persistencia con PostgreSQL y un seed inicial para pruebas.

## Descripcion del proyecto
Gestion Alimentaria Inteligente es una plataforma que ayuda a los usuarios a organizar su alimentacion diaria. Permite registrar productos, administrar inventario con fechas de vencimiento, obtener recomendaciones de recetas segun preferencias y restricciones, y mantener un perfil nutricional con metas de consumo. El objetivo es reducir desperdicios, mejorar habitos saludables y simplificar la planificacion de comidas.

## Arquitectura y persistencia
- Framework: NestJS con TypeScript.
- Base de datos: PostgreSQL.
- ORM: TypeORM (entidades en src/modules/**/entities).
- Documentacion: Swagger en /api.
- CORS habilitado para pruebas.

## Autenticacion
- Estrategia JWT con Bearer token.
- Endpoints:
  - POST /auth/register: crea usuario y retorna access_token.
  - POST /auth/login: autentica usuario y retorna access_token.
  - POST /auth/logout: revoca token actual.
- El token se envía en el header Authorization: Bearer <token>.

## Autorizacion
- Roles definidos: user, admin, nutritionist.
- Control por decorador @Roles y guard RolesGuard.
- Endpoints restringidos:
  - /users/* (admin).
  - /roles/assign (admin).
  - /products POST/PATCH (admin o nutritionist).
  - /seed/run (admin).

## Seed (carga inicial)
- Script CLI: npm run seed.
- Endpoint protegido: POST /seed/run (solo admin).
- Datos de ejemplo:
  - Usuarios demo (admin y user).
  - Productos base.
  - Recetas publicas.
  - Inventario inicial.
  - Perfil nutricional inicial.

## Endpoints

### Health
- GET /: retorna mensaje de estado.

### Auth
- POST /auth/register
  - Body: email, password, first_name, last_name.
  - Respuesta: access_token y datos del usuario.
- POST /auth/login
  - Body: email, password.
  - Respuesta: access_token y datos del usuario.
- POST /auth/logout
  - Header: Authorization Bearer.
  - Respuesta: mensaje de logout.

### Users (requiere JWT + admin excepto /me)
- GET /users/me
  - Respuesta: usuario autenticado.
- GET /users
  - Respuesta: listado de usuarios.
- GET /users/:id
  - Param: id.
- PATCH /users/:id
  - Param: id.
  - Body: UpdateUserDto.
- DELETE /users/:id
  - Param: id.

### Roles (requiere JWT + admin)
- POST /roles/assign
  - Body: email, role.
  - Respuesta: mensaje y usuario actualizado.

### Products (requiere JWT; POST/PATCH requiere admin o nutritionist)
- POST /products
  - Body: CreateProductDto.
- GET /products
  - Query: q, category.
- GET /products/barcode/:barcode
  - Param: barcode.
- GET /products/:id
  - Param: id.
- PATCH /products/:id
  - Param: id.
  - Body: UpdateProductDto.
- DELETE /products/:id
  - Param: id.

### Inventory
- POST /inventory
  - Body: CreateInventoryItemDto.
- GET /inventory
  - Query: q, category.
- GET /inventory/stats
  - Respuesta: totales, proximos a vencer y vencidos.
- GET /inventory/:id
  - Param: id.
- PATCH /inventory/:id
  - Param: id.
  - Body: UpdateInventoryItemDto.
- DELETE /inventory/:id
  - Param: id.

### Recipes
- POST /recipes
  - Body: CreateRecipeDto.
- GET /recipes
  - Query: q, category, difficulty, isPublic.
- GET /recipes/:id
  - Param: id.
- PATCH /recipes/:id
  - Param: id.
  - Body: UpdateRecipeDto.
- PATCH /recipes/:id/rate
  - Param: id.
  - Body: rating (1-5).
- DELETE /recipes/:id
  - Param: id.

### Nutrition (requiere JWT)
- GET /nutrition/profile
  - Respuesta: perfil nutricional del usuario.
- PUT /nutrition/profile
  - Body: NutritionProfileDto.

### Recommendations (requiere JWT)
- POST /recommendations
  - Body: CreateRecommendationFeedbackDto.
- GET /recommendations
  - Query: recipeId.
- GET /recommendations/top-rated
  - Query: limit.
- GET /recommendations/:id
  - Param: id.
- PATCH /recommendations/:id
  - Param: id.
  - Body: UpdateRecommendationFeedbackDto.
- DELETE /recommendations/:id
  - Param: id.

### Scans (requiere JWT)
- POST /scans
  - Body: multipart/form-data con file.
  - Accion: analiza imagen y guarda item en inventario.

### Seed (requiere JWT + admin)
- POST /seed/run
  - Accion: carga datos iniciales.

## Swagger
- URL: /api.
- Incluye modelos, parametros y respuestas basicas por endpoint.

## Pruebas
- Unitarias: Jest (npm run test).
- E2E: Jest + Supertest (npm run test:e2e).

## Postman
- Coleccion: postman/Alacena API.postman_collection.json
- Environment local: postman/Alacena Local.postman_environment.json

## Variables de entorno
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- NODE_ENV
- JWT_SECRET
- Opcionales para seed:
  - SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
  - SEED_USER_EMAIL, SEED_USER_PASSWORD

## Despliegue
- Proveedor sugerido: Render (web service) + PostgreSQL gestionado.
- Pasos usados para despliegue:
  1. Crear un servicio web en Render desde el repositorio.
  2. Configurar variables de entorno (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, JWT_SECRET, NODE_ENV=production, DB_SSL=true).
  3. Configurar el comando de build: npm run build.
  4. Configurar el comando de start: npm run start:prod.
  5. Verificar Swagger en /api y endpoint de salud en /.
- URL publica: [https://taller-nest-blackandwhites.onrender.com].
