import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { cloudQuery, findMember } from '@/lib/cloud-db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = verifyToken(token)
    const { id } = await params
    if (!await findMember(id, session.koperasiRef)) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })

    const { demoCode } = await request.json()
    const code = String(demoCode || '')
    if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: 'Masukkan kode simulasi enam digit' }, { status: 400 })
    const result = await cloudQuery<{ fingerprint_mode: string; fingerprint_demo_secret_hash: string | null; fingerprint_enrolled_at: Date | null }>(
      `select fingerprint_mode, fingerprint_demo_secret_hash, fingerprint_enrolled_at from app_member_profile where anggota_ref=$1 and koperasi_ref=$2`,
      [id, session.koperasiRef],
    )
    const profile = result.rows[0]
    if (!profile?.fingerprint_enrolled_at || profile.fingerprint_mode !== 'demo' || !profile.fingerprint_demo_secret_hash) {
      return NextResponse.json({ error: 'Anggota belum memiliki enrol simulasi sidik jari.' }, { status: 409 })
    }

    const expected = Buffer.from(profile.fingerprint_demo_secret_hash, 'hex')
    const actual = Buffer.from(crypto.createHash('sha256').update(`${id}:${code}`).digest('hex'), 'hex')
    const matched = expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
    return NextResponse.json({ ok: true, matched, score: matched ? 100 : 0, mode: 'demo', message: matched ? 'Cocok: simulasi verifikasi berhasil.' : 'Tidak cocok: kode simulasi berbeda.' })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
