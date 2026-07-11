import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyToken } from '@/lib/auth'
import { cloudQuery, withCloudTransaction } from '@/lib/cloud-db'

function tokenFrom(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  return token ? verifyToken(token) : null
}

export async function GET(request: NextRequest) {
  try {
    const session = tokenFrom(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 100)
    const where = ["a.koperasi_ref = $1"]
    const values: unknown[] = [session.koperasiRef]
    if (search) { values.push(`%${search}%`); where.push(`(a.nama ilike $${values.length} or a.nik ilike $${values.length} or a.anggota_ref ilike $${values.length})`) }
    if (status) { values.push(status); where.push(`a.status_keanggotaan = $${values.length}`) }
    const clause = where.join(' and ')
    const [members, count] = await Promise.all([
      cloudQuery(`select a.anggota_ref as id,a.anggota_ref as "memberId",a.nik,a.nama,a.status_keanggotaan as status,a.tanggal_terdaftar as "tanggalDaftar",p.foto,p.phone,p.email from anggota_koperasi a left join app_member_profile p on p.anggota_ref=a.anggota_ref and p.koperasi_ref=a.koperasi_ref where ${clause} order by a.tanggal_terdaftar desc nulls last limit $${values.length + 1} offset $${values.length + 2}`, [...values, limit, (page - 1) * limit]),
      cloudQuery<{total:string}>(`select count(*) as total from anggota_koperasi a where ${clause}`, values),
    ])
    const total = Number(count.rows[0].total)
    return NextResponse.json({ members: members.rows, total, page, totalPages: Math.max(Math.ceil(total / limit), 1) })
  } catch { return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const session = tokenFrom(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { nik, nama, phone, email, foto, jenisKelamin, pekerjaan } = await request.json()
    if (!/^[0-9]{16}$/.test(String(nik || ''))) return NextResponse.json({ error: 'NIK harus terdiri dari 16 digit' }, { status: 400 })
    if (!nama || !phone || !foto) return NextResponse.json({ error: 'Nama, nomor telepon, dan foto wajib diisi' }, { status: 400 })
    const anggotaRef = `ANG-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`
    try {
      await withCloudTransaction(async (query) => {
        await query(`insert into anggota_koperasi (anggota_ref,koperasi_ref,nama,nik,jenis_kelamin,status_keanggotaan,tanggal_terdaftar,dibuat_pada,diperbarui_pada,pekerjaan) values ($1,$2,$3,$4,$5,'Aktif',current_date,now(),now(),$6)`, [anggotaRef, session.koperasiRef, nama, nik, jenisKelamin || null, pekerjaan || null])
        await query(`insert into app_member_profile (anggota_ref,koperasi_ref,phone,email,foto) values ($1,$2,$3,$4,$5)`, [anggotaRef, session.koperasiRef, phone, email || null, foto])
      })
    } catch (error: unknown) {
      if ((error as { code?: string }).code === '23505') {
        const existing = await cloudQuery<{nama_koperasi:string|null; nik_koperasi:string|null}>(`select pr.nama_koperasi,pr.nik_koperasi from anggota_koperasi a left join profil_koperasi pr on pr.koperasi_ref=a.koperasi_ref where a.nik=$1 limit 1`, [nik])
        const koperasi = existing.rows[0]
        return NextResponse.json({ error: `NIK sudah terdaftar di koperasi ${koperasi?.nama_koperasi || 'lain'}${koperasi?.nik_koperasi ? ` (${koperasi.nik_koperasi})` : ''}.` }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ member: { id: anggotaRef, memberId: anggotaRef } }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 }) }
}
