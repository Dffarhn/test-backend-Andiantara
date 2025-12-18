## Interview Notes — Inventory Management API (Express + TS + PostgreSQL + JWT)

Dokumen ini merangkum cara kerja codebase `TestBEAndiantara` supaya kamu bisa menjelaskan dengan runtut saat interview.

---

## 1) Gambaran besar arsitektur

Pola utama: **Route → Controller → Service → Model (DB) → Response**, dengan **middleware** untuk auth & error.

- **`src/server.ts`**
  - Entry point untuk menjalankan HTTP server.
  - `app.listen(PORT)` dan log informasi basic.

- **`src/app.ts`**
  - Setup Express: `express.json()`.
  - Endpoint `GET /health`.
  - Mount API di `/api` → `src/routes/index.ts`.
  - Pasang `errorMiddleware` terakhir (global error handler).

- **`src/routes/*`**
  - Definisi endpoint dan mapping ke controller.

- **`src/controllers/*`**
  - Tugas: ambil input dari request (body/params/req.user), panggil service, balas dengan format response standar.
  - Error dilempar ke `next(error)`.

- **`src/services/*`**
  - Tugas: **business logic + validasi** (required fields, UUID, aturan stok tidak boleh minus, dsb).
  - Kalau validasi gagal: throw `AppError(message, statusCode)`.

- **`src/models/*`**
  - Tugas: interaksi ke PostgreSQL pakai `dbPool.query(...)`.
  - Pakai parameter `$1, $2, ...` untuk menghindari SQL injection.
  - Mapping row SQL → object TypeScript.

- **`src/middlewares/*`**
  - `auth.middleware.ts`: autentikasi JWT Bearer.
  - `error.middleware.ts`: error handler global.
  - `app-error.ts`: definisi `AppError`.

- **`src/utils/*`**
  - `response.ts`: format response seragam.
  - `hash.ts`: hashing + compare password (bcrypt).

- **`src/config/*`**
  - `database.ts`: konfigurasi `pg.Pool`.
  - `jwt.ts`: sign & verify token.

---

## 2) Endpoint & proteksi auth

Base URL default: `http://localhost:3000`

### Public (tanpa token)
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected (wajib header `Authorization: Bearer <token>`)
Semua endpoint items diproteksi karena di `src/routes/item.routes.ts` ada:
- `itemRouter.use(authMiddleware)`

Daftar endpoint:
- `POST /api/items`
- `GET /api/items`
- `GET /api/items/:id`
- `PATCH /api/items/:id` (update name/description)
- `PATCH /api/items/:id/stock` (IN/OUT)
- `GET /api/items/:id/activities`
- `DELETE /api/items/:id`

---

## 3) Format response

Semua response mengikuti:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

Implementasi ada di **`src/utils/response.ts`**:
- `successResponse(res, message, data, statusCode?)`
- `errorResponse(res, message, statusCode)`

---

## 4) Error handling

- **`src/middlewares/app-error.ts`**
  - `AppError` menyimpan `statusCode`.

- **`src/middlewares/error.middleware.ts`**
  - Jika `err instanceof AppError` → balikin error sesuai `statusCode`.
  - Jika error tak terduga → log dan balikin 500.

Pola yang dipakai controller: `try/catch` lalu `next(error)`.

---

## 5) Auth (Register / Login) — alur detail

### Register
File terkait:
- `src/controllers/auth.controller.ts` → `register`
- `src/services/auth.service.ts` → `registerUser`
- `src/models/user.model.ts` → `createUser`, `findUserByEmail`
- `src/utils/hash.ts` → `hashPassword`

Flow:
1. Controller ambil `name, email, password` dari `req.body`.
2. Service validasi:
   - required
   - format email
   - cek email sudah terdaftar (`findUserByEmail`) → kalau iya throw 400.
3. Hash password (bcrypt).
4. Insert user ke DB.
5. Return **safe user** (tanpa password).

### Login
File terkait:
- `src/controllers/auth.controller.ts` → `login`
- `src/services/auth.service.ts` → `loginUser`
- `src/models/user.model.ts` → `findUserByEmail`
- `src/utils/hash.ts` → `comparePassword`
- `src/config/jwt.ts` → `signToken`

Flow:
1. Cari user by email.
2. Compare password.
3. Kalau valid → sign JWT payload `{ id, email }`.
4. Response: `{ token, user }`.

---

## 6) JWT & Auth middleware

- **`src/config/jwt.ts`**
  - `signToken(payload)` menggunakan `JWT_SECRET` dan `JWT_EXPIRES_IN`.
  - `verifyToken(token)` mengembalikan payload `{ id, email }`.

- **`src/middlewares/auth.middleware.ts`**
  - Validasi header `Authorization` harus `Bearer ...`.
  - `verifyToken` lalu set `req.user = { id, email }`.
  - Kalau invalid/expired → 401.

- **`src/global.d.ts`**
  - Extend typing Express: `req.user` ada dan bertipe `JwtPayload`.

---

## 7) Items (CRUD + aturan stok)

File terkait:
- Controller: `src/controllers/item.controller.ts`
- Service: `src/services/item.service.ts`
- Model: `src/models/item.model.ts`

### Create Item — `POST /api/items`
Validasi utama (service):
- `userId` wajib (dari `req.user.id`).
- `name` wajib.
- `stock` opsional, kalau ada harus number dan tidak boleh negatif.

Model:
- Insert `items (name, description, stock, created_by)`.
- Setelah insert, fetch lagi `getItemById` untuk hasil yang sudah include join user.

### Get Items — `GET /api/items`
- Ambil semua items, join `users` untuk `createdBy`.
- Order by `created_at DESC`.

### Get Item By Id — `GET /api/items/:id`
Validasi (service):
- `id` wajib dan harus UUID.
- Kalau tidak ditemukan → 404.

### Update Details — `PATCH /api/items/:id`
Validasi (service):
- `id` wajib dan UUID.
- Harus ada minimal satu field: `name` atau `description`.
- Pastikan item exist.

Model:
- SQL pakai `COALESCE($1, name)` / `COALESCE($2, description)` supaya partial update.

### Update Stock — `PATCH /api/items/:id/stock`
Ini bagian paling “interviewable”.

Validasi (service):
- `id` wajib dan UUID.
- `userId` wajib (audit activity log).
- `type` harus `'IN'` atau `'OUT'`.
- `quantity` harus integer > 0.
- Stock setelah perubahan tidak boleh negatif.

Flow:
1. Fetch item by id.
2. Hitung `delta` (IN = +quantity, OUT = -quantity).
3. Update stock item.
4. Buat activity log (audit) lewat `logStockChange`.
5. Response mengembalikan item yang terupdate + activity.

### Delete Item — `DELETE /api/items/:id`
Validasi (service):
- UUID + existence.
- Lalu delete.

---

## 8) Activity Logs

File terkait:
- Controller: `src/controllers/activity.controller.ts`
- Service: `src/services/activity.service.ts`
- Model: `src/models/activity.model.ts`

Endpoint:
- `GET /api/items/:id/activities`

Ciri penting:
- Log dibuat saat update stock.
- Query join `activity_logs` + `users` + `items` agar response punya detail user & item.

---

## 9) Database & migrations

- **`src/config/database.ts`** membentuk `dbPool` dari env:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

- Folder **`migrations/`** berisi SQL untuk init dan perubahan skema.
- Script migrasi: `src/scripts/migrate.ts` (dijalankan via `npm run migrate`).

---

## 10) “Script” jawaban interview (1–2 menit)

> “Project ini adalah REST API inventory menggunakan Express + TypeScript, PostgreSQL sebagai database, dan JWT untuk autentikasi. Entry point ada di `server.ts` yang menjalankan `app` dari `app.ts`. Di `app.ts` saya pasang JSON parser, endpoint healthcheck, mount router `/api`, dan global error handler.
>
> Strukturnya pakai separation of concerns: route hanya mapping endpoint, controller untuk parsing request dan membentuk response standar, service berisi business logic dan validasi, dan model khusus query database.
>
> Untuk autentikasi, endpoint `register/login` publik. Setelah login, server mengeluarkan JWT berisi `{id,email}`. Semua endpoint `/api/items` diproteksi middleware yang memverifikasi token Bearer dan mengisi `req.user`.
>
> Contoh flow `PATCH /api/items/:id/stock`: middleware cek token, controller ambil `type` dan `quantity`, service memvalidasi UUID, action IN/OUT, quantity integer > 0, dan memastikan stok tidak negatif. Setelah update stok di tabel items, sistem membuat activity log yang mencatat siapa melakukan perubahan, jenis aksi, jumlah, dan waktu. Response mengembalikan item terbaru dan activity log sebagai audit trail.”

---

## 11) Pertanyaan interview yang kemungkinan keluar + jawaban singkat

- **Kenapa pakai layer controller/service/model?**
  - Supaya rapi: controller fokus HTTP, service fokus aturan bisnis, model fokus DB. Mudah dites dan dipelihara.

- **Gimana cara mencegah SQL injection?**
  - Semua query pakai parameter `$1, $2, ...` dengan array values.

- **Kenapa password harus di-hash?**
  - Untuk keamanan; password tidak disimpan plain text. Mengurangi impact kalau DB bocor.

- **Kenapa JWT payload minimal?**
  - Token sebaiknya tidak menyimpan data sensitif; cukup identitas untuk authorize.

- **Apa yang terjadi kalau token expired?**
  - `verifyToken` throw → middleware balas 401 “Invalid or expired token”.

- **Gimana memastikan stok tidak bisa minus?**
  - Service menghitung `newStock` dan throw 400 kalau `< 0`.

- **Kenapa ada activity log?**
  - Audit trail perubahan stok: siapa, kapan, IN/OUT, quantity.

---

## 12) Hal yang layak kamu sebut sebagai improvement (opsional)

Ini bukan wajib, tapi bagus kalau ditanya “apa yang bisa diperbaiki?”
- Validasi request bisa dipindah ke schema validator (mis. zod/joi) untuk konsistensi.
- Operasi update stock + insert activity log idealnya dalam **DB transaction** agar atomic.
- JWT secret fallback `'dev-secret'` bagusnya hanya untuk dev, di production harus wajib env.

---

## 13) Checklist cepat sebelum interview

- Hafal flow `PATCH /items/:id/stock` (ini paling kuat untuk demo business logic).
- Hafal cara kerja middleware JWT dan `req.user` typing.
- Hafal error flow: `throw AppError` → ditangkap `errorMiddleware`.
- Siap jelasin kenapa query pakai parameterized SQL.
