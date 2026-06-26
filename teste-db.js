const { Pool } = require("pg")

const db = new Pool({
  host: "localhost",
  database: "atenthos",
  user: "postgres",
  password: "senha",
  port: 5433,
})

db.query("SELECT 1").then(() => {
  console.log("✅ Conectou!")
  process.exit(0)
}).catch(err => {
  console.error("❌ Erro:", err.message)
  process.exit(1)
})