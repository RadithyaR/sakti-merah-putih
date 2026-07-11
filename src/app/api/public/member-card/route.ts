import { NextRequest, NextResponse } from 'next/server'
import { cloudQuery } from '@/lib/cloud-db'

type PublicMemberCard = {
  memberId: string
  nama: string
  namaKoperasi: string
  lokasiKeanggotaan: string | null
}

export async function GET(request: NextRequest) {
  try {
    const cardUid = request.nextUrl.searchParams.get('cardUid')?.trim()
    const memberId = request.nextUrl.searchParams.get('memberId')?.trim()
    if (!cardUid && !memberId) {
      return NextResponse.json({ error: 'Masukkan UID kartu atau nomor anggota.' }, { status: 400 })
    }
    if (cardUid && !/^\d{10}$/.test(cardUid)) {
      return NextResponse.json({ error: 'UID kartu harus tepat 10 digit angka.' }, { status: 400 })
    }

    const filter = cardUid ? 'p.member_card_uid = $1' : 'a.anggota_ref = $1'
    const value = cardUid || memberId
    const result = await cloudQuery<PublicMemberCard>(
      `select a.anggota_ref as "memberId", a.nama,
              pr.nama_koperasi as "namaKoperasi",
              coalesce(pr.alamat_lengkap, rw.kode_wilayah) as "lokasiKeanggotaan"
         from anggota_koperasi a
         left join app_member_profile p
           on p.anggota_ref=a.anggota_ref and p.koperasi_ref=a.koperasi_ref
         left join profil_koperasi pr on pr.koperasi_ref=a.koperasi_ref
         left join referensi_koperasi_wilayah rw on rw.koperasi_ref=a.koperasi_ref
        where ${filter}
        limit 1`,
      [value],
    )
    const member = result.rows[0]
    if (!member) return NextResponse.json({ error: 'Kartu anggota tidak ditemukan.' }, { status: 404 })

    return NextResponse.json({ member }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}
