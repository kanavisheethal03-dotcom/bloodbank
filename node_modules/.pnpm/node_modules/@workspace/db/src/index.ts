import dotenv from "dotenv";
dotenv.config({ path: new URL("../../../.env", import.meta.url).pathname.substring(1) });
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// For Supabase, use the Transaction Pooler (Port 6543) in serverless environments.
// If running a long-lived server, the Session Pooler (Port 5432) or Direct Connection is also fine.
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10, // Adjust based on your Supabase tier
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
