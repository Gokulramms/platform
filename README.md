# ASHA CABLE COMMUNICATION & ANITHA FIBERNET

> Business management dashboard for managing monthly subscriptions of Cable TV and Internet customers.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/) or use [Neon DB](https://neon.tech))

### Step 1 — Install Dependencies
```bash
npm install
```

### Step 2 — Setup Environment
```bash
# Copy the example env file
copy .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/asha_cable?schema=public"
NEXTAUTH_SECRET="any-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@ashacable.com"
ADMIN_PASSWORD="Admin@1234"
```

### Step 3 — Initialize Database
```bash
# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to browse data
npm run db:studio
```

### Step 4 — Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your admin credentials.

---

## 🌐 Deployment (Vercel + Neon DB)

### 1. Setup Neon DB (Free)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the **Connection String**
3. It looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### 2. Deploy to Vercel
1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/asha-cable
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. Add these **Environment Variables** in Vercel:
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon DB connection string |
   | `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` |
   | `ADMIN_EMAIL` | `admin@ashacable.com` |
   | `ADMIN_PASSWORD` | Your chosen password |

4. Click **Deploy** — Vercel will build and deploy automatically

5. After deployment, run the database migration:
   - Prisma runs `prisma generate` automatically via `postinstall`
   - Push schema: In Vercel → Functions → run `npx prisma db push`
   - OR: Set `DATABASE_URL` locally to Neon and run `npm run db:push` once

---

## 📁 Project Structure

```
platform/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handlers
│   │   ├── customers/             # Customer CRUD
│   │   ├── payments/              # Payment toggle
│   │   │   └── bulk/             # Mark all paid
│   │   └── dashboard/            # Stats API
│   ├── dashboard/
│   │   ├── layout.tsx            # Auth-guarded layout
│   │   ├── page.tsx              # Stats dashboard
│   │   ├── internet/page.tsx     # Internet grid
│   │   └── cable/page.tsx        # Cable TV grid
│   ├── login/page.tsx            # Admin login
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Providers.tsx             # Session + QueryClient
│   ├── Sidebar.tsx               # Navigation
│   ├── StatCard.tsx              # Stat display card
│   ├── SearchBar.tsx             # Search input
│   ├── CustomerGrid.tsx          # 200-box grid
│   ├── CustomerBox.tsx           # Single box tile
│   ├── CustomerModal.tsx         # Add/Edit form
│   └── PaymentPanel.tsx          # Payment history panel
├── lib/
│   ├── prisma.ts                 # DB client singleton
│   └── auth.ts                   # NextAuth config
├── prisma/
│   └── schema.prisma             # Database schema
├── utils/
│   ├── cn.ts                     # Classname utility
│   └── months.ts                 # Month helpers
├── middleware.ts                  # Route protection
└── vercel.json                   # Vercel config
```

---

## 🧩 Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Total customers, paid/unpaid stats, recent payments |
| 📡 Internet Grid | 200 boxes for internet connections |
| 📺 Cable Grid | 200 boxes for cable connections |
| ✅ Payment Tracking | Month-wise paid/unpaid status with dates |
| 💚 Mark All Paid | One-click mark all payments as paid |
| 🔍 Search | By customer name or box number |
| 🎯 Filter | All / Paid / Unpaid filter per month |
| ✏️ CRUD | Add, edit, delete customers |
| 🔐 Auth | Admin login with session protection |
| 📱 Responsive | Works on mobile and desktop |

---

## 🎨 Color Coding

| Color | Meaning |
|---|---|
| 🟢 Green | Customer assigned + paid this month |
| 🔴 Red | Customer assigned + unpaid this month |
| ⬜ Gray (dashed) | Empty box — click to add customer |

---

## 🔐 Default Login

- **Email**: `admin@ashacable.com`
- **Password**: `Admin@1234`

> Change via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables

---

## 📊 Database Schema

### Customer
| Field | Type | Description |
|---|---|---|
| id | String | Unique ID |
| name | String | Customer name |
| phone | String | Phone number |
| address | String | Full address |
| connectionType | Enum | INTERNET or CABLE |
| boxNumber | Int | Box/connection number |
| planAmount | Float | Monthly amount in ₹ |

### Payment
| Field | Type | Description |
|---|---|---|
| id | String | Unique ID |
| customerId | String | FK to Customer |
| month | Int | 1-12 |
| year | Int | e.g. 2025 |
| status | Enum | PAID or UNPAID |
| paymentDate | DateTime? | Auto-set when marked paid |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS
- **Animation**: Framer Motion
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (JWT sessions)
- **State**: TanStack React Query
- **Hosting**: Vercel + Neon DB
