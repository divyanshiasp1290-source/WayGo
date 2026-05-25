const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  const env = {};

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    env[key] = value;
  }

  return env;
}

async function main() {
  const env = loadEnv();
  const connectionString = env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing from .env");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase database");

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}`);
    try {
      await client.query(sql);
    } catch (error) {
      console.error(`Failed in ${file}: ${error.message}`);
      throw error;
    }
  }

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `);
  console.log(`Tables: ${tables.rows.map((row) => row.table_name).join(", ")}`);

  const buckets = await client.query(`
    select id
    from storage.buckets
    where id in ('vendor-documents', 'driver-documents')
    order by id
  `);
  console.log(`Buckets: ${buckets.rows.map((row) => row.id).join(", ")}`);

  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
