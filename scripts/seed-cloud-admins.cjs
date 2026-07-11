const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const admins = [
  ['admin1', 'PGR-111866D29507', 'KOP-0008016CB39E'],
  ['admin2', 'PGR-4F839F1283A9', 'KOP-00297D0FF509'],
  ['admin3', 'PGR-4ED0DF85AA76', 'KOP-0078F95BF9F4'],
]

async function main() {
  if (!process.env.CLOUDSQL_DATABASE_URL) throw new Error('CLOUDSQL_DATABASE_URL wajib diatur')
  const pool = new Pool({ connectionString: process.env.CLOUDSQL_DATABASE_URL })
  const passwordHash = await bcrypt.hash('admin123', 10)
  try {
    for (const [username, pengurusRef, koperasiRef] of admins) {
      await pool.query(`
        insert into app_pengurus_login (username, pengurus_ref, koperasi_ref, password_hash, role)
        values ($1, $2, $3, $4, 'Admin')
        on conflict (username) do update set
          pengurus_ref = excluded.pengurus_ref,
          koperasi_ref = excluded.koperasi_ref,
          password_hash = excluded.password_hash,
          diperbarui_pada = now()
      `, [username, pengurusRef, koperasiRef, passwordHash])
    }
    console.log('Seeded 3 Cloud SQL admin accounts.')
  } finally {
    await pool.end()
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
