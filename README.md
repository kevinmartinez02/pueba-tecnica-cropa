# Gestor de tareas

Aplicación de práctica que conecta una interfaz web con una API REST y una base de datos SQLite. Permite iniciar sesión, consultar y filtrar tareas, crear tareas sin asignar, asignarlas a un usuario y cambiar su estado.

## Tecnologías

| Área | Tecnología | Uso |
| --- | --- | --- |
| Monorepositorio | Espacios de trabajo de pnpm y Turborepo | Dependencias y tareas del repositorio |
| Interfaz web | Next.js 16, React 19 y TypeScript | Interfaz y rutas web |
| Estilos | Tailwind CSS 4, shadcn/ui y Base UI | Componentes y estilos responsivos |
| Datos de la interfaz | TanStack Query | Consultas, cambios y actualización de datos |
| Cliente de la API | Hey API | Cliente TypeScript generado desde OpenAPI/Swagger |
| Servidor | NestJS 12 | API REST y documentación Swagger |
| ORM | TypeORM | Entidades, repositorios y migraciones |
| Base de datos | SQLite con `better-sqlite3` | Persistencia local en un archivo |
| Contenedor auxiliar | Docker Compose y Alpine | Comparte la carpeta de la base y ofrece el comando `sqlite3` |
| Contraseñas | bcrypt | Generación y verificación de hashes de contraseñas |

La autenticación es deliberadamente sencilla para la prueba: la API valida usuario y contraseña; el frontend conserva el perfil público en una cookie `HttpOnly`.

## Requisitos

- Node.js 26.x
- pnpm 11.25.x
- Docker Desktop con el comando `docker compose`

`better-sqlite3` incluye un módulo nativo; usa la misma versión principal de Node para instalar las dependencias y ejecutar la aplicación.

Comprueba las versiones:

```bash
node --version
pnpm --version
```

## Instalación y preparación

La API puede usar sus valores predeterminados. Si quieres configurarlos, crea `apps/api/.env` antes de arrancar:

```env
PORT=8000
DATABASE_PATH=data/app.sqlite
```

`DATABASE_PATH` es relativo a `apps/api`; por defecto la base queda en `apps/api/data/app.sqlite`. El archivo se crea automáticamente. SQLite sigue siendo un archivo local que usa la API mediante `better-sqlite3`; el contenedor Alpine del Compose comparte esa carpeta y ofrece el comando `sqlite3`, no ejecuta un servidor de base de datos.

Para la web, los valores predeterminados ya apuntan a `http://localhost:8000`. Si necesitas cambiarlos, crea `apps/web/.env.local` a partir de `apps/web/.env.example` antes de arrancar y ajusta estas variables:

```env
API_URL=http://localhost:8000
OPENAPI_URL=http://localhost:8000/api-json
```

Desde la raíz del repositorio, ejecuta este comando para instalar dependencias, aplicar migraciones, cargar los datos de prueba y arrancar el proyecto:

```bash
pnpm start:local
```

El comando termina ejecutando `pnpm dev`. Este levanta el servicio `sqlite` del `compose.yaml` y luego inicia la API y la interfaz web.

La carga de datos de prueba agrega cinco usuarios y diez tareas asignadas a cada uno. Se puede ejecutar varias veces: agrega los usuarios o las tareas de prueba que falten y no cambia las contraseñas existentes.

## Credenciales de prueba

Las cuentas de prueba incluidas usan la contraseña `Demo1234`:

| Usuario | Contraseña |
| --- | --- |
| `maria` | `Demo1234` |
| `john` | `Demo1234` |
| `ana` | `Demo1234` |
| `carlos` | `Demo1234` |
| `lucia` | `Demo1234` |

Si una cuenta ya existía antes de cargar los datos de prueba, se conserva su contraseña actual.

## Ejecutar la aplicación

Para arrancar manualmente después de instalar y preparar la base, ejecuta `pnpm dev` desde la raíz. Este comando levanta Compose y las dos aplicaciones.

Abre dos terminales si prefieres ejecutar cada aplicación por separado. Para esa modalidad, primero levanta Compose:

```bash
docker compose up -d
```

Terminal 1, servidor de la API:

```bash
pnpm --filter api dev
```

Terminal 2, interfaz web:

```bash
pnpm --filter web dev
```

Abre `http://localhost:3000`. La API escucha en `http://localhost:8000` y Swagger está disponible en `http://localhost:8000/api`.

Para detener el contenedor de SQLite CLI, ejecuta `docker compose down`.

## Flujo disponible

1. Inicia sesión con una cuenta de prueba.
2. Consulta las tareas y el usuario asignado; filtra por usuario.
3. Crea una tarea con título y descripción opcional. Se guarda inicialmente sin asignar.
4. Usa **Asignar** en la fila de la tarea para elegir un usuario. Si ya tiene uno, puedes cambiarlo.
5. Cambia el estado entre pendiente y completada.

## Rutas de la API

| Método | Ruta | Función |
| --- | --- | --- |
| `POST` | `/tasks/login` | Valida las credenciales y devuelve el perfil público |
| `GET` | `/tasks/users` | Lista los usuarios disponibles |
| `GET` | `/tasks` | Lista tareas; acepta `?userId=1` para filtrar |
| `POST` | `/tasks` | Crea una tarea sin asignar; recibe `title` y `description` opcional |
| `PATCH` | `/tasks/:id/assign` | Asigna o cambia el usuario; recibe `userId` |
| `PATCH` | `/tasks/:id/status` | Cambia el estado a `pending` o `complete` |

La creación devuelve un mensaje de confirmación. La respuesta de la lista incluye el usuario asignado o `null` cuando la tarea todavía no tiene asignación.

## Base de datos y migraciones

Las tablas `users` y `tasks` se crean mediante migraciones TypeORM. Los comandos se ejecutan desde la raíz:

```bash
pnpm --filter api migration:show
pnpm --filter api migration:create -- NombreDeLaMigracion
pnpm --filter api migration:generate -- NombreDeLaMigracion
pnpm --filter api migration:run
pnpm --filter api migration:revert
```

Puedes abrir `apps/api/data/app.sqlite` con DataGrip o cualquier cliente compatible con SQLite.

## Cliente Hey API

Si cambian las rutas o los DTO, inicia la API y regenera el cliente desde su documento OpenAPI:

```bash
pnpm --filter web api:generate
```

El cliente generado se guarda en `apps/web/lib/api/generated/`.

## Compilación

```bash
pnpm --filter api build
pnpm --filter web build
```
