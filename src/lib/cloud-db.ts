import { Pool, type QueryResultRow } from 'pg'

const globalForCloud = globalThis as unknown as { cloudPool?: Pool }

function pool() {
  const url = process.env.CLOUDSQL_DATABASE_URL
  if (!url) throw new Error('CLOUDSQL_DATABASE_URL wajib diatur untuk data anggota dan pengurus.')
  globalForCloud.cloudPool ??= new Pool({ connectionString: url })
  return globalForCloud.cloudPool
}

export async function cloudQuery<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return pool().query<T>(text, values)
}

export async function withCloudTransaction<T>(work: (query: <R extends QueryResultRow>(text: string, values?: unknown[]) => Promise<{ rows: R[] }>) => Promise<T>) {
  const client = await pool().connect()
  try {
    await client.query('begin')
    const result = await work((text, values = []) => client.query(text, values))
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export type CloudMember = {
  anggota_ref: string
  koperasi_ref: string
  nama: string
  nik: string
  jenis_kelamin: string | null
  status_keanggotaan: string | null
  tanggal_terdaftar: Date | null
  pekerjaan: string | null
  phone: string | null
  email: string | null
  foto: string | null
  member_card_uid: string | null
}

export type MemberView = CloudMember & {
  nama_koperasi: string | null
  nik_koperasi: string | null
}

type CloudKtpMock = {
  nik: string
  rfid_uid: string
  nama: string
  tempat_lahir: string
  tanggal_lahir: Date | string
  jenis_kelamin: string
  alamat: string
  rt_rw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  agama: string
  status_perkawinan: string
  pekerjaan: string
}

export type KtpMock = {
  nik: string
  rfidUid: string
  nama: string
  tempatLahir: string
  tanggalLahir: Date
  jenisKelamin: string
  alamat: string
  rtRw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  agama: string
  statusPerkawinan: string
  pekerjaan: string
}

function mapKtpMock(record: CloudKtpMock): KtpMock {
  return {
    nik: record.nik, rfidUid: record.rfid_uid, nama: record.nama,
    tempatLahir: record.tempat_lahir, tanggalLahir: new Date(record.tanggal_lahir),
    jenisKelamin: record.jenis_kelamin, alamat: record.alamat, rtRw: record.rt_rw,
    kelurahan: record.kelurahan, kecamatan: record.kecamatan, kabupaten: record.kabupaten,
    provinsi: record.provinsi, agama: record.agama, statusPerkawinan: record.status_perkawinan,
    pekerjaan: record.pekerjaan,
  }
}

export async function findKtpMockByRfidUid(rfidUid: string) {
  const result = await cloudQuery<CloudKtpMock>(`select nik,rfid_uid,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,alamat,rt_rw,kelurahan,kecamatan,kabupaten,provinsi,agama,status_perkawinan,pekerjaan from app_ktp_mock where rfid_uid=$1`, [rfidUid])
  return result.rows[0] ? mapKtpMock(result.rows[0]) : null
}

export async function findKtpMockByNik(nik: string) {
  const result = await cloudQuery<CloudKtpMock>(`select nik,rfid_uid,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,alamat,rt_rw,kelurahan,kecamatan,kabupaten,provinsi,agama,status_perkawinan,pekerjaan from app_ktp_mock where nik=$1`, [nik])
  return result.rows[0] ? mapKtpMock(result.rows[0]) : null
}

export async function randomKtpMock() {
  const result = await cloudQuery<CloudKtpMock>(`select nik,rfid_uid,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,alamat,rt_rw,kelurahan,kecamatan,kabupaten,provinsi,agama,status_perkawinan,pekerjaan from app_ktp_mock order by random() limit 1`)
  return result.rows[0] ? mapKtpMock(result.rows[0]) : null
}

export async function listMembers(koperasiRef: string, search = '', status = '', limit = 10, offset = 0) {
  const filters = ['a.koperasi_ref = $1']
  const values: unknown[] = [koperasiRef]
  if (search) { values.push(`%${search}%`); filters.push(`(a.nama ilike $${values.length} or a.nik ilike $${values.length} or a.anggota_ref ilike $${values.length})`) }
  if (status) { values.push(status); filters.push(`a.status_keanggotaan = $${values.length}`) }
  const where = filters.join(' and ')
  const [rows, count] = await Promise.all([
    cloudQuery<MemberView>(`select a.anggota_ref,a.koperasi_ref,a.nama,a.nik,a.jenis_kelamin,a.status_keanggotaan,a.tanggal_terdaftar,a.pekerjaan,p.phone,p.email,p.foto,p.member_card_uid,pr.nama_koperasi,pr.nik_koperasi from anggota_koperasi a left join app_member_profile p on p.anggota_ref=a.anggota_ref and p.koperasi_ref=a.koperasi_ref left join profil_koperasi pr on pr.koperasi_ref=a.koperasi_ref where ${where} order by a.tanggal_terdaftar desc nulls last limit $${values.length + 1} offset $${values.length + 2}`, [...values, limit, offset]),
    cloudQuery<{ total: string }>(`select count(*) as total from anggota_koperasi a where ${where}`, values),
  ])
  return { members: rows.rows, total: Number(count.rows[0].total) }
}

export async function findMember(anggotaRef: string, koperasiRef: string) {
  const result = await cloudQuery<MemberView>(`
    select a.anggota_ref, a.koperasi_ref, a.nama, a.nik, a.jenis_kelamin,
           a.status_keanggotaan, a.tanggal_terdaftar, a.pekerjaan,
           p.phone, p.email, p.foto, p.member_card_uid, pr.nama_koperasi, pr.nik_koperasi
      from anggota_koperasi a
      left join app_member_profile p
        on p.anggota_ref = a.anggota_ref and p.koperasi_ref = a.koperasi_ref
      left join profil_koperasi pr on pr.koperasi_ref = a.koperasi_ref
     where a.anggota_ref = $1 and a.koperasi_ref = $2
  `, [anggotaRef, koperasiRef])
  return result.rows[0] ?? null
}
