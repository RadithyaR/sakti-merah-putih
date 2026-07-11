const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')

async function main() {
  if (!process.env.CLOUDSQL_DATABASE_URL) throw new Error('CLOUDSQL_DATABASE_URL wajib diatur')

  const local = new PrismaClient()
  const cloud = new Pool({ connectionString: process.env.CLOUDSQL_DATABASE_URL })
  try {
    const records = await local.ktpRecord.findMany({ orderBy: { id: 'asc' } })
    const client = await cloud.connect()
    try {
      await client.query('begin')
      for (const record of records) {
        await client.query(
          `insert into app_ktp_mock (
             nik,rfid_uid,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,alamat,rt_rw,
             kelurahan,kecamatan,kabupaten,provinsi,agama,status_perkawinan,pekerjaan,diperbarui_pada
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now())
           on conflict (nik) do update set
             rfid_uid=excluded.rfid_uid,nama=excluded.nama,tempat_lahir=excluded.tempat_lahir,
             tanggal_lahir=excluded.tanggal_lahir,jenis_kelamin=excluded.jenis_kelamin,
             alamat=excluded.alamat,rt_rw=excluded.rt_rw,kelurahan=excluded.kelurahan,
             kecamatan=excluded.kecamatan,kabupaten=excluded.kabupaten,provinsi=excluded.provinsi,
             agama=excluded.agama,status_perkawinan=excluded.status_perkawinan,
             pekerjaan=excluded.pekerjaan,diperbarui_pada=now()`,
          [
            record.nik, record.rfidUid, record.nama, record.tempatLahir, record.tanggalLahir,
            record.jenisKelamin, record.alamat, record.rtRw, record.kelurahan, record.kecamatan,
            record.kabupaten, record.provinsi, record.agama, record.statusPerkawinan, record.pekerjaan,
          ],
        )
      }
      await client.query('commit')
      console.log(`Cloud SQL KTP mock seeded: ${records.length} records.`)
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  } finally {
    await local.$disconnect()
    await cloud.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
