# CivicConnect (Citizen Complaint Portal)

CivicConnect is an end-to-end municipal complaint logging and redressal system designed with a 3-layer Role-Based Access Control (RBAC) model (Supabase RLS, Express JWT & Profile middleware, React Route Guards).

---

## Project Structure

```text
SE project/
├── client/                     # React (Vite) + React Router + Recharts
│   ├── src/
│   │   ├── components/         # Minimal, sleek custom UI components
│   │   ├── context/            # Auth & Notification State
│   │   ├── pages/              # Citizen, Officer, Admin portals
│   │   └── services/           # API and Supabase clients
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # Supabase Admin & Env configurations
│   │   ├── middleware/         # JWT verification & RBAC check
│   │   ├── routes/             # Citizen, Officer, Admin routes
│   │   ├── services/           # AI Triage (Single LLM call) & node-cron jobs
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Tables, relationships, foreign keys
│       ├── 002_rls_policies.sql      # Row Level Security for all roles
│       ├── 003_analytics_views.sql   # SQL Views for Admin KPIs & metrics
│       └── 004_seed_data.sql         # Seed departments, categories, subcategories
└── README.md
```

---

## Step 1: Database Setup Instructions

1. Open your Supabase project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** in the left sidebar.
3. Run each migration in the `supabase/migrations/` folder in numerical order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_analytics_views.sql`
   - `004_seed_data.sql`
4. Create a public storage bucket named **`complaint-photos`** in **Storage -> New Bucket** (set to Public so uploaded photos can be displayed on tickets).
