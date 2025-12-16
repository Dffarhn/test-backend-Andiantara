## Inventory Management API (Node.js, Express, TypeScript, PostgreSQL)

Backend REST API untuk manajemen inventaris barang, menggunakan:

- Node.js
- Express.js
- TypeScript (strict)
- PostgreSQL
- JWT Authentication

### Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Siapkan database PostgreSQL dan buat database sesuai `DB_NAME`.

3. Jalankan migration (menggunakan script TypeScript):

```bash
npm run migrate
```

4. Jalankan server (development):

```bash
npm run dev
```

### Environment Variables

Lihat `.env.example`:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Endpoint Utama

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/items`
- `GET /api/items`
- `GET /api/items/:id`
- `PATCH /api/items/:id` (update name/description)
- `PATCH /api/items/:id/stock`
- `GET /api/items/:id/activities`
- `DELETE /api/items/:id`

Seluruh response menggunakan format:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```


