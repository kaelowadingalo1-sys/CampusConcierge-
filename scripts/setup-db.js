// Creates the schema (and optional sample data) in the database named by DATABASE_URL.
// Usage: DATABASE_URL=postgres://user:pass@localhost:5432/concierge node scripts/setup-db.js [--sample]
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("Set DATABASE_URL first."); process.exit(1); }
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  const dir = path.join(__dirname, "..", "migrations-or-schema");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();
  for (const f of files) {
    if (f.includes("sample") && !process.argv.includes("--sample")) continue;
    await client.query(fs.readFileSync(path.join(dir, f), "utf8"));
    console.log("applied", f);
  }
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
