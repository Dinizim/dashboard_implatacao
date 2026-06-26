import { Pool } from "pg"

const globalForDb = global as unknown as { pool: Pool }

export const db =
  globalForDb.pool ||
  new Pool({
    host: "localhost",
    user: "postgres",
    database: "atenthos",
    password: "senha",
    port: 5433,
  })

if (process.env.NODE_ENV !== "production") globalForDb.pool = db