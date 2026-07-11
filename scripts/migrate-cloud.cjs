const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
  if (!process.env.CLOUDSQL_DATABASE_URL) throw new Error('CLOUDSQL_DATABASE_URL wajib diatur')
  const pool = new Pool({ connectionString: process.env.CLOUDSQL_DATABASE_URL })
  const migrationsDir = path.join(__dirname, '../prisma/cloud/migrations')
  const migrations = fs.readdirSync(migrationsDir).sort().map((entry) =>
    fs.readFileSync(path.join(migrationsDir, entry, 'migration.sql'), 'utf8')
  )
  try {
    await pool.query('begin')
    for (const sql of migrations) await pool.query(sql)
    await pool.query('commit')
    console.log('Cloud SQL member/pengurus migration applied.')
  } catch (error) {
    await pool.query('rollback')
    throw error
  } finally {
    await pool.end()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
