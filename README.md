# GameVault — žaidimų biblioteka

Žiniatinklio programa žaidimų katalogui: įvertinimai, kainos, paieška, atsiliepimai. Backend — Node.js (Express) ir MySQL; sąsaja — statinis frontend su API.

## Technologijos

- **Backend:** Node.js, Express, mysql2
- **Duomenų bazė:** MySQL 8 (Docker)
- **Frontend:** HTML, CSS, JavaScript

## Paleidimas

1. **Docker** (MySQL ir phpMyAdmin):

   ```bash
   docker-compose up -d
   ```

2. **Backend** (iš `backend/` katalogo):

   ```bash
   npm install
   npm run seed
   npm start
   ```

3. Naršyklėje atidaryk `http://localhost:3000`.

## Testai

```bash
cd backend
npm test
npm run test:coverage
```

## Licencija

Projektas skirtas mokymosi / kursinio tikslams.
