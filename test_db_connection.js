// test_db_connection.js

import pkg from 'pg';
const { Client } = pkg;

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("❌ A variável SUPABASE_DB_URL não está definida.");
  process.exit(1);
}

const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    const res = await client.query("SELECT NOW();");
    console.log("✅ Conexão bem-sucedida!");
    console.log("⏰ Horário no servidor:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Erro ao conectar:", err.message);
  } finally {
    await client.end();
  }
})();