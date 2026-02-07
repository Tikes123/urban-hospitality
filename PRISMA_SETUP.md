# Prisma ORM Setup Guide
Super-admin: tx@master.iam / sekit
Vendor/Admin: admin@test.com / test123
Vendor: vendor@test.com / test123
## Overview
This project uses **Prisma ORM** with **MySQL** database for data management.

## Database Models
The following models have been defined:
- **Client** - Companies/organizations (hotels, restaurants, bars)
- **Outlet** - Individual locations/branches
- **Designation** - Job positions/roles
- **Candidate** - Job applicants/candidates
- **CVLink** - CV sharing links for candidates

## Setup Instructions

### 1. Install Dependencies
Dependencies are already installed. If needed:
```bash
npm install
```

### 2. Configure Database Connection
1. Create a `.env` file in the root directory (if not exists)
2. Add your MySQL connection string:
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Example (for local MySQL without password):
```env
DATABASE_URL="mysql://root@localhost:3306/urban_hospitality"
```

Or if you have a password:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/urban_hospitality"
```

### 3. Create Database
Make sure your MySQL database exists. You can create it using:
```sql
CREATE DATABASE urban_hospitality;
```

### 4. Run Migrations
Create the database tables:
```bash
npm run prisma:migrate
```
Or:
```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client
Generate the Prisma Client (usually done automatically, but can be run manually):
```bash
npm run prisma:generate
```

### 6. Seed (optional): Super-admin and sample data
After migrations, run the seed to create the **super-admin** account and optional sample outlets:
```bash
npx prisma db seed
```
- **Test accounts** (create/update when you run the seed):

  | Role        | Email           | Password | Use after login                    |
  |------------|------------------|----------|------------------------------------|
  | Super-admin | `tx@master.iam` | `sekit`  | Go to `/super-admin` (vendors, menu permissions, payments, blogs) |
  | Vendor/Admin | `admin@test.com` | `test123` | Go to `/admin` or `/vendor` (dashboard, applicants, outlets, etc.) |
  | Vendor     | `vendor@test.com` | `test123` | Same as above (second test vendor) |

- Requires `DATABASE_URL` in `.env` and `@prisma/adapter-mariadb` (same as the app). If `admin_users` does not exist yet, run `npx prisma migrate deploy` first, then seed again.

### 7. Open Prisma Studio (Optional)
View and edit your database using Prisma Studio:
```bash
npm run prisma:studio
```

## Usage in Code

### Import Prisma Client
```typescript
import { prisma } from "@/lib/prisma"
```

### Example Queries

#### Get all clients
```typescript
const clients = await prisma.client.findMany()
```

#### Create a client
```typescript
const client = await prisma.client.create({
  data: {
    name: "Grand Plaza Hotel Group",
    type: "hotel",
    contactPerson: "Sarah Johnson",
    email: "sarah@grandplaza.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    outlets: 3,
    employees: 150,
    contractValue: 250000,
    contractStart: new Date("2024-01-01"),
    contractEnd: new Date("2024-12-31"),
    status: "active",
    rating: 4.8,
    services: JSON.stringify(["Staff Management", "Training", "Recruitment"]),
  }
})
```

#### Get client with outlets
```typescript
const client = await prisma.client.findUnique({
  where: { id: 1 },
  include: { outletList: true }
})
```

#### Create a candidate
```typescript
const candidate = await prisma.candidate.create({
  data: {
    firstName: "John",
    lastName: "Doe",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    position: "Hotel Manager",
    experience: "5 years",
    location: "New York, NY",
    status: "recently-applied",
    source: "Website",
    rating: 4.5,
  }
})
```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run dev` - Start development server (auto-generates Prisma Client)
- `npm run build` - Build for production (auto-generates Prisma Client)

## Notes

- The Prisma client is automatically generated when you run `npm run dev` or `npm run build`
- Always run migrations before deploying to production
- Use Prisma Studio for easy database management during development
- JSON arrays are stored as strings in MySQL (services, requirements, etc.) - parse them when reading
