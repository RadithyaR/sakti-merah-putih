import { NextRequest, NextResponse } from 'next/server'
import { cloudQuery } from '@/lib/cloud-db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = verifyToken(token)
    const { cardUid } = await request.json()
    const uid = String(cardUid || '').trim()
    if (!/^\d{10}$/.test(uid)) return NextResponse.json({ error: 'UID kartu harus tepat 10 digit angka.' }, { status: 400 })

    const result = await cloudQuery<{
      memberId: string; nama: string; nik: string; jenisKelamin: string | null; status: string | null
      phone: string | null; email: string | null; namaKoperasi: string | null; lokasiKeanggotaan: string | null
      rfidUid: string | null; pekerjaan: string | null
    }>(
      `select a.anggota_ref as "memberId", a.nama, a.nik, a.jenis_kelamin as "jenisKelamin",
              a.status_keanggotaan as status, a.pekerjaan, p.phone, p.email,
              pr.nama_koperasi as "namaKoperasi", coalesce(pr.alamat_lengkap, rw.kode_wilayah) as "lokasiKeanggotaan",
              k.rfid_uid as "rfidUid"
         from anggota_koperasi a
         join app_member_profile p on p.anggota_ref=a.anggota_ref and p.koperasi_ref=a.koperasi_ref
         left join profil_koperasi pr on pr.koperasi_ref=a.koperasi_ref
         left join referensi_koperasi_wilayah rw on rw.koperasi_ref=a.koperasi_ref
         left join app_ktp_mock k on k.nik=a.nik
        where p.member_card_uid=$1 and a.koperasi_ref=$2
        limit 1`,
      [uid, session.koperasiRef],
    )
    const member = result.rows[0]
    if (!member) return NextResponse.json({ error: 'Kartu tidak ditemukan pada koperasi Anda.' }, { status: 404 })
    return NextResponse.json({ member }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}
