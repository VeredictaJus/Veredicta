import pkg from 'pg';
const { Client } = pkg;

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("❌ Variável SUPABASE_DB_URL não definida!");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  await client.connect();
  console.log("🔗 Conectado ao banco com sucesso.");

  // 1️⃣ Cria a extensão pgcrypto (se não existir)
  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  console.log("✅ Extensão pgcrypto confirmada.");

  // 2️⃣ Corrige a coluna id
  await client.query(`
    ALTER TABLE auth.users
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `);
  console.log("✅ Coluna 'id' corrigida com gen_random_uuid().");

  // 3️⃣ Confirma a alteração
  const res = await client.query(`
    SELECT column_name, column_default
    FROM information_schema.columns
    WHERE table_schema='auth'
    AND table_name='users'
    AND column_name='id';
  `);

  console.log("📋 Resultado:", res.rows);
} catch (err) {
  console.error("❌ Erro ao aplicar correção:", err.message);
} finally {
  await client.end();
}