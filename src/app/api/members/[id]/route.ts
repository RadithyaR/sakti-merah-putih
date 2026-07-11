import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cloudQuery, findMember, withCloudTransaction } from '@/lib/cloud-db'
import { prisma } from '@/lib/prisma'

function session(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  return token ? verifyToken(token) : null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = session(request); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const member = await findMember(id, user.koperasiRef)
    if (!member) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
    const ktpRecord = await prisma.ktpRecord.findUnique({ where: { nik: member.nik } })
    return NextResponse.json({ member: { ...member, id: member.anggota_ref, memberId: member.anggota_ref, status: member.status_keanggotaan, tanggalDaftar: member.tanggal_terdaftar, ktpRecord } })
  } catch { return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 }) }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = session(request); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params; const body = await request.json()
    const existing = await findMember(id, user.koperasiRef)
    if (!existing) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
    if (!body.nama || !body.phone || !body.status) return NextResponse.json({ error: 'Nama, telepon, dan status wajib diisi' }, { status: 400 })
    await withCloudTransaction(async (query) => {
      await query(`update anggota_koperasi set nama=$1,status_keanggotaan=$2,tanggal_terdaftar=coalesce($3::date,tanggal_terdaftar),pekerjaan=$4,diperbarui_pada=now() where anggota_ref=$5 and koperasi_ref=$6`, [body.nama, body.status, body.tanggalDaftar || null, body.pekerjaan || null, id, user.koperasiRef])
      await query(`update app_member_profile set phone=$1,email=$2,foto=$3,diperbarui_pada=now() where anggota_ref=$4 and koperasi_ref=$5`, [body.phone, body.email || null, body.foto || existing.foto || '', id, user.koperasiRef])
    })
    return GET(request, { params: Promise.resolve({ id }) })
  } catch { return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = session(request); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const result = await cloudQuery(`delete from anggota_koperasi where anggota_ref=$1 and koperasi_ref=$2`, [id, user.koperasiRef])
    return result.rowCount ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
  } catch { return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 }) }
}
