# Auth Backend (NestJS)

Production-ready authentication and authorization backend built with NestJS, Prisma, PostgreSQL, JWT, RBAC, email verification, password reset, and session management.

## Features

- JWT Authentication
- Refresh Token Authentication
- Role-Based Access Control (RBAC)
- Email Verification
- Password Reset Flow
- Session Management
- User Management
- Protected Routes
- Swagger Documentation
- PostgreSQL Database
- Prisma ORM
- Docker Support
- Health Check Endpoint
- Global Exception Handling
- Request Logging
- Environment Validation

---

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Passport.js
- Swagger
- Docker

---

## API Documentation

Swagger UI:

```bash
/api/docs
```

Health Check:

```bash
/health
```

---

## Environment Variables

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
```

---

## Installation

```bash
npm install
```

---

## Database Migration

```bash
npx prisma migrate dev
```

---

## Run Development Server

```bash
npm run start:dev
```

---

## Build

```bash
npm run build
```

---

## Security Features

- Password Hashing (bcrypt)
- JWT Access Tokens
- Refresh Tokens
- Secure Authentication Flow
- Request Validation
- Role-Based Authorization
- Environment Validation

---

## Project Status

Production Ready

---

## Author

Mohammad Ramezani - DaRiaN0Dev

## License

[MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE)
