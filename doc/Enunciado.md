# Taller: Nest JS

**Docente:** Kevin Rodriguez – kdrodriguez@icesi.edu.co
**Entrega:** Domingo, 26 de abril 2026

## Objetivo

Desarrollar una aplicación backend robusta con Nest JS, que utilice PostgreSQL para la persistencia de datos y pruebas unitarias para el proyecto a realizar.

## Requisitos mínimos

### Seed (5%)

- Alimentar la base de datos con registros iniciales que permitan la realización de pruebas y/o su funcionamiento.
- Usar un endpoint o script que permita el cargue inicial de los datos.

### Autenticación (7%)

- Implementar un sistema de autenticación basado en tokens JWT (Json Web Tokens).
- Los usuarios deben poder iniciar sesión y cerrar sesión.
- Debe hacer rutas protegidas y requerir autenticación.

### Autorización (8%)

- Definir al menos dos roles diferentes o la cantidad que tenga su aplicación.
- Establecer los permisos basados en roles para restringir el acceso a ciertas rutas o funcionalidades.
- Los roles deben asignarse mediante algún mecanismo de administración.

### Pruebas (20%)

- Implementar pruebas unitarias (Jest) y de integración (supertest o Postman). O cualquier otra biblioteca de pruebas compatible con Nest JS (Pathwright).

### Persistencia en base de datos (10%)

- Utilizar un ORM (por ejemplo, TypeORM) para interactuar con una base de datos relacional.

### Funcionalidades (20%)

- Implementar las funcionalidades necesarias en el backend para la aplicación escogida por grupo.
- Adjuntar el archivo JSON de Postman que permita ejecutar las pruebas de forma manual.

### Informe (10%)

- Preparar un informe detallado que describa las funcionalidades implementadas en la API.
- El informe debe incluir una descripción de cada endpoint, sus parámetros y respuestas.
- Además, debe explicar cómo se implementaron las características de autenticación, autorización y persistencia de la base de datos.

### Despliegue (10%)

- Se debe desplegar en algún servicio en nube.
- Para evitar consumir sus créditos, realice un video demostrando el despliegue del aplicativo y cierre el despliegue.

### Swagger (5%)

- Agregar la documentación de Swagger en los endpoints.

### Github Actions (5%)

- Agregar un pipeline de GitHub Actions que compruebe al hacer un pull request y al hacer un push a la rama `main` que las pruebas funcionen correctamente.

## Entrega

- Los estudiantes deben presentar el código fuente del proyecto junto con un `README` que incluya instrucciones para ejecutar la aplicación y probar cada funcionalidad.
- Se revisarán commits para determinar el nivel de participación de los estudiantes.
- Además, se debe proporcionar un informe detallado que describa las funcionalidades implementadas en la API, explicando cómo se implementaron las características de autenticación, autorización y persistencia en la base de datos, así como la ejecución de las pruebas.

## Contexto de la aplicación

La aplicación **Gestión Alimentaria Inteligente** es una plataforma digital orientada a optimizar la forma en que los jóvenes adultos administran su alimentación diaria mediante el uso de automatización e inteligencia artificial. Su propósito principal es reducir la carga operativa y cognitiva asociada a la planificación de comidas, al tiempo que promueve hábitos saludables y el consumo responsable de alimentos.

En términos funcionales, la aplicación permite registrar productos de manera automática (por escaneo de tickets o reconocimiento de imágenes), gestionar un inventario doméstico con control de fechas de vencimiento y alertas, y generar recomendaciones personalizadas de recetas basadas en los alimentos disponibles y las preferencias del usuario. Adicionalmente, incorpora un sistema de seguimiento nutricional que facilita el control de calorías y macronutrientes, junto con perfiles personalizados donde se definen objetivos alimenticios.

Desde una perspectiva estratégica, la solución busca impactar tres frentes clave: mejorar la salud y nutrición de los usuarios, disminuir el desperdicio de alimentos mediante una gestión eficiente del inventario, y ofrecer una experiencia digital intuitiva y adaptativa. En conjunto, la aplicación se posiciona como una herramienta integral que combina tecnología y bienestar para transformar la gestión alimentaria en un proceso más eficiente, personalizado y sostenible.

## Nutrición y Recomendaciones

El sistema de recomendaciones se fundamenta en un perfil de usuario altamente configurable que integra preferencias alimenticias, restricciones y objetivos nutricionales. El usuario puede definir su tipo de dieta (omnívora, vegetariana o vegana), lo que permite filtrar automáticamente cualquier receta que no cumpla con dichos criterios. Adicionalmente, puede excluir ingredientes específicos o incluso familias de alimentos —ya sea por alergias(maní), intolerancias(lácteos) o simples preferencias(pescado)— garantizando que las recomendaciones sean seguras y alineadas con sus gustos. Sobre esta base, el sistema incorpora un módulo de seguimiento nutricional donde el usuario establece un rango máximo de calorías diarias y metas de macronutrientes (proteínas, grasas y carbohidratos). A partir de esta configuración, las recetas sugeridas no solo cumplen con las restricciones definidas, sino que también contribuyen de manera controlada al consumo diario, evitando exceder los límites establecidos. Este proceso se optimiza priorizando el uso de ingredientes disponibles en el inventario doméstico, dando mayor relevancia a aquellos próximos a vencer para reducir el desperdicio. Asimismo, el usuario puede activar un filtro estricto que limita las recomendaciones exclusivamente a recetas que puedan prepararse con los ingredientes actualmente disponibles, fortaleciendo la eficiencia y coherencia del sistema.



**Diagnóstico del estado actual**

1. Nutrición está vacía: [nutrition.controller.ts**:4**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) y [nutrition.service.ts**:4**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
2. Recomendaciones hoy maneja feedback (CRUD y top-rated), no un motor de recomendación basado en perfil/inventario: [recommendations.controller.ts**:18**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [recommendations.controller.ts**:35**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [recommendations.service.ts**:42**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [recommendations.service.ts**:78**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
3. Hay inconsistencia en feedback por usuario:
   * La entidad exige unicidad userId + recipeId: [recommendation-feedback.entity.ts**:13**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
   * El servicio valida solo por recipeId: [recommendations.service.ts**:23**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [recommendations.service.ts**:24**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
   * El DTO no trae userId: [create-recommendation-feedback.dto.ts**:10**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
4. Falta seguridad en recomendaciones/nutrición: hay guardas en roles, pero no en recomendaciones. Comparar [roles.controller.ts**:17**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) con [recommendations.controller.ts**:18**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
5. Persistencia de dominio insuficiente para personalización:
   * Usuarios en memoria: [users.service.ts**:6**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
   * User no es entidad TypeORM: [user.entity.ts**:1**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
   * Inventario en memoria: [inventory.service.ts**:5**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [inventory.service.ts**:26**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
   * Recipes/Products sin lógica: [recipes.service.ts**:4**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [products.service.ts**:4**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).
6. Pruebas todavía no cubren nutrición/recomendaciones: [scans.service.spec.ts**:11**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [scans.controller.spec.ts**:4**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [app.controller.spec.ts**:5**](vscode-file://vscode-app/opt/visual-studio-code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).

**Ajustes que sí o sí debes hacer**

1. Crear modelo persistente mínimo: perfil nutricional del usuario, recetas con ingredientes y macros, inventario con vencimiento.
2. Implementar endpoints de nutrición: guardar/consultar dieta, exclusiones, límites de calorías y metas de macros.
3. Implementar endpoint de recomendaciones reales (no solo feedback): filtrar por dieta/restricciones, priorizar inventario y próximos a vencer, y soportar modo estricto solo con ingredientes disponibles.
4. Proteger nutrición y recomendaciones con JWT y tomar userId desde token, no desde body.
5. Corregir la lógica de feedback para validar por userId + recipeId.
6. Agregar seed de recetas/productos/perfiles para poder demostrar y probar.
7. Agregar pruebas unitarias del motor de scoring y pruebas e2e de endpoints de nutrición/recomendaciones.

**Cómo empezar hoy (orden recomendado)**

1. Vertical slice 1: persistencia base de usuario, inventario y recetas.
2. Vertical slice 2: perfil nutricional (GET/PUT) y validaciones.
3. Vertical slice 3: generar recomendaciones con scoring simple.
4. Vertical slice 4: feedback de recomendaciones integrado al usuario autenticado.
5. Vertical slice 5: seed + tests + colección Postman para demo.

Si quieres, en el siguiente paso te puedo proponer un backlog de 10 tareas concretas (con prioridad y esfuerzo) para que lo implementen en orden sin bloquearse.
