# Backend — AI-Powered Digital Fraud Risk Analyzer

## Requirements

- Java 21
- Maven 3.9+ (or the Maven wrapper, if present)
- A MongoDB database
- Environment variables `MONGODB_URI` and `JWT_SECRET`

## Configure environment variables

The application intentionally does not store database credentials or the JWT signing secret in `application.properties`.

Set these variables in your shell or IDE run configuration before starting Spring Boot:

- `MONGODB_URI`: the complete MongoDB connection URI for your database.
- `JWT_SECRET`: a cryptographically random secret with at least 32 UTF-8 bytes.

Do not commit a real `.env` file, database URI, password, or JWT secret. The `.env.example` file contains placeholders only.

## Start the backend

From this directory, run:

```bash
mvn spring-boot:run
```

The API uses port 8080 by default.

## Authentication API

### Register

`POST /api/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "choose-a-password"
}
```

Success: HTTP 201 Created.

```json
{
  "token": "<signed-jwt>",
  "email": "user@example.com"
}
```

Registration requires a valid email and a password of at least 8 characters. Passwords are stored as BCrypt hashes, never as plain text.

### Login

`POST /api/auth/login`

Uses the same request shape as registration. Success returns HTTP 200 with a JWT and the normalized email. Invalid credentials return HTTP 401; an already registered email returns HTTP 409.

### Current user

`GET /api/auth/me`

Requires a valid JWT. Example header:

```http
Authorization: Bearer <signed-jwt>
```

Success:

```json
{
  "email": "user@example.com"
}
```

### Protected analysis endpoints

All endpoints other than registration, login, and CORS preflight requests require a valid JWT, including:

- `POST /api/analyze/url`
- `POST /api/analyze/message`
- `POST /api/analyze/qr`

Example request body:

```json
{
  "value": "https://example.com"
}
```

Send the token in the `Authorization: Bearer <token>` header. Requests without a valid token should receive HTTP 401.

## Security notes

- JWTs expire after 24 hours.
- Tokens are signed and verified with the configured secret.
- Passwords are hashed with BCrypt.
- Spring Security is stateless; it does not create a server-side login session.
- The current JWT principal is the user's email. This protects endpoints, but scan records are not yet automatically linked to their owner.
- Configure production CORS with an explicit allow-list of your deployed frontend origins before deployment.
