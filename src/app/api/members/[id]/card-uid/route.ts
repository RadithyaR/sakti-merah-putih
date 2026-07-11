import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cloudQuery, findMember } from '@/lib/cloud-db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = verifyToken(token)
    const { id } = await params
    const { cardUid } = await request.json()
    const uid = String(cardUid || '').trim()
    if (!/^\d{10}$/.test(uid)) return NextResponse.json({ error: 'UID kartu anggota harus tepat 10 digit angka' }, { status: 400 })
    if (!await findMember(id, session.koperasiRef)) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
    await cloudQuery(`update app_member_profile set member_card_uid=$1,diperbarui_pada=now() where anggota_ref=$2 and koperasi_ref=$3`, [uid, id, session.koperasiRef])
    return NextResponse.json({ ok: true, memberCardUid: uid })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as { code?: string }).code === '23505' ? 'UID kartu anggota sudah dipakai anggota lain' : 'Terjadi kesalahan pada server' }, { status: (error as { code?: string }).code === '23505' ? 409 : 500 })
  }
}
