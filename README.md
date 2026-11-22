# Student Management

## Local development

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm start
```

The frontend preview server listens on port 4173 and proxies `/api` to `http://localhost:3001`.

Copy `backend/.env.example` to `backend/.env` and update database credentials before starting the API.

## Docker

```bash
docker compose up --build
```

The application is available at `http://localhost`. Database data persists in the `postgres_data` volume.
# final-project
