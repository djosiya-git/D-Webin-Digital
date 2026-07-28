# Backend MySQL Portfolio

Backend ini memakai Express + MySQL.

## Akun Admin Default

```txt
username: admin
password: admin123
```

## Cara Menjalankan

1. Start MySQL lewat Laragon/XAMPP.
2. Pastikan konfigurasi `server/.env` sesuai:

```txt
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=dwebin
PORT=3001
```

3. Jalankan backend:

```bash
npm run server
```

4. Jalankan React di terminal lain:

```bash
npm run dev
```

Server akan otomatis membuat database, tabel, user admin, dan data proyek awal.

## Endpoint Utama

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/projects`
- `POST /api/projects`
- `DELETE /api/projects/:id`
- `GET /api/messages`
- `POST /api/messages`
- `DELETE /api/messages/:id`
