# Test API

A simple REST API built with Express.js to interact with the Users, Accounts, and Transactions database schema.

## Prerequisites
- Node.js
- SQL Server database (configured in `.env`)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

## Running the API
Start the server:
```bash
npm start
```
The API will be available at `http://localhost:3000`.

## API Endpoints

### Users
- `GET /api/users`: List all users.
- `POST /api/users`: Create a new user.
  - Body: `{ "FullName": "John Doe", "Email": "john@example.com" }`

### Accounts
- `GET /api/accounts`: List all accounts.
- `POST /api/accounts`: Create a new account.
  - Body: `{ "UserId": 1, "Balance": 1000.50, "Currency": "USD" }`

### Transactions
- `GET /api/transactions`: List all transactions.
- `POST /api/transactions`: Create a new transaction.
  - Body: `{ "AccountId": 1, "Amount": 50.00, "TransactionType": "Deposit", "Description": "Initial deposit" }`

## Testing with curl

**Get all users:**
```bash
curl http://localhost:3000/api/users
```

**Create a user:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"FullName":"Jane Smith", "Email":"jane@example.com"}' http://localhost:3000/api/users
```

## Non-Functional Testing (ADEVA)

Se añadieron artefactos no funcionales en:
- `proposals/non-functional/non-functional-performance-proposal.md`
- `tests/non-functional/k6-performance.js`
- `tests/non-functional/artillery-load.yml`

### 1) Instalar dependencias
```bash
npm install
```

### 2) Ejecutar suite completa (K6 + carga sostenida)
```bash
npm run test:nfr
```

### 3) Ejecutar pruebas por separado
```bash
npm run test:nfr:k6
npm run test:nfr:load
```

### Requisitos
- Tener el servidor arriba en `http://localhost:3000`.
- Tener `k6` instalado en tu sistema (`artillery` se instala con npm).
