## Inventory Management API (Node.js, Express, TypeScript, PostgreSQL)

Backend REST API untuk manajemen inventaris barang, menggunakan:

- Node.js
- Express.js
- TypeScript (strict)
- PostgreSQL
- JWT Authentication

Base URL (default): `http://localhost:3000`

### Author

Muhammad Daffa Raihan

### Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Siapkan environment variable:

- Copy `.env.example` menjadi `.env`, lalu isi nilainya sesuai environment kamu.

3. Siapkan database PostgreSQL dan buat database sesuai `DB_NAME`.

4. Jalankan migration (menggunakan script TypeScript):

```bash
npm run migrate
```

5. Jalankan server (development):

```bash
npm run dev
```

### Environment Variables

Lihat contoh di `.env.example`. Variable yang digunakan:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Endpoint Utama

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/items`
- `GET /api/items`
- `GET /api/items/:id`
- `PATCH /api/items/:id` (update name/description)
- `PATCH /api/items/:id/stock`
- `GET /api/items/:id/activities`
- `DELETE /api/items/:id`

### Postman Collection

File collection tersedia di: `Inventory Management API - Muhammad Daffa Raihan.postman_collection.json`.

Alternatif (online docs): `https://www.postman.com/material-explorer-83708155/workspace/testbackend/request/41538267-08c6d085-3233-48c5-b747-ecccb6c39747?action=share&creator=41538267&ctx=documentation`.

Seluruh response menggunakan format:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```


