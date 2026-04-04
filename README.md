# PotatoContra website 
# url: potatocontra.onrender.com

PotatoContra now includes a Docker setup for the full stack:

- `db`: PostgreSQL
- `api`: Express + Prisma backend
- `frontend`: Vite app served by Nginx

## Run with Docker

From the project root:

```bash
docker compose up --build
```

After the containers finish starting:

- App: `http://localhost:8080`
- API: `http://localhost:7007`
- Postgres: `localhost:5432`

To stop everything:

```bash
docker compose down
```

To stop and also remove the database volume:

```bash
docker compose down -v
```

## Environment

The Docker setup uses this database connection inside containers:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/potatocontra?schema=public"
```

For local non-Docker development, copy values from `.env.example` into `.env`.

## Notes

- The frontend proxies `/api` requests to the backend through Nginx.
- The backend runs Prisma migrations automatically when the API container starts.
- `CORS_ORIGIN` is now configurable so local dev and Docker can both work cleanly.

## Deploy Publicly on Render

This repo now includes a one-service Render deployment setup:

- [render.yaml](./render.yaml)
- [Dockerfile.web](./Dockerfile.web)

That deployment builds the React client, serves it from Express, and connects the app to a managed Render Postgres database.

### Steps

1. Push this repo to GitHub.
2. Sign in to Render and create a new Blueprint deployment.
3. Point Render at your GitHub repo.
4. Render will detect `render.yaml` and create:
   - one web service named `potatocontra`
   - one Postgres database named `potatocontra-db`
5. Wait for the first deploy to finish, then open the generated `.onrender.com` URL.

### Notes

- Health checks use `/health`.
- Render injects `PORT`, so the app will bind automatically.
- The public deployment uses one domain for both frontend and API, so you do not need separate frontend CORS setup there.
