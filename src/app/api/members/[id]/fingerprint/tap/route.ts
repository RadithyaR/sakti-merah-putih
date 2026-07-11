import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyToken } from '@/lib/auth'
import { cloudQuery, findMember } from '@/lib/cloud-db'

const defaultAgentUrl = 'http://127.0.0.1:7373'
const demoTarget = 4

function fingerprintMode() {
  return process.env.FINGERPRINT_MODE === 'station' ? 'station' : 'demo'
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = verifyToken(token)
    const { id } = await params
    if (!await findMember(id, session.koperasiRef)) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })

    if (fingerprintMode() === 'demo') {
      const profile = await cloudQuery<{ fingerprint_enrollment_taps: number; fingerprint_mode: string; fingerprint_enrolled_at: Date | null }>(
        `select fingerprint_enrollment_taps, fingerprint_mode, fingerprint_enrolled_at
           from app_member_profile where anggota_ref=$1 and koperasi_ref=$2`,
        [id, session.koperasiRef],
      )
      const current = profile.rows[0]
      if (!current) return NextResponse.json({ error: 'Profil anggota tidak ditemukan' }, { status: 404 })
      if (current.fingerprint_mode === 'demo' && current.fingerprint_enrolled_at) {
        return NextResponse.json({ ok: true, enrollment: { mode: 'demo', templatesTotal: demoTarget, target: demoTarget, coverageComplete: true, message: 'Simulasi sidik jari sudah ter-enrol.' } })
      }

      const templatesTotal = Math.min(current.fingerprint_enrollment_taps + 1, demoTarget)
      const coverageComplete = templatesTotal === demoTarget
      const demoCode = coverageComplete ? String(crypto.randomInt(0, 1_000_000)).padStart(6, '0') : undefined
      const demoHash = demoCode ? crypto.createHash('sha256').update(`${id}:${demoCode}`).digest('hex') : null
      await cloudQuery(
        `update app_member_profile
            set fingerprint_mode='demo', fingerprint_enrollment_taps=$1,
                fingerprint_enrolled_at=case when $2 then now() else fingerprint_enrolled_at end,
                fingerprint_demo_secret_hash=coalesce($3, fingerprint_demo_secret_hash), diperbarui_pada=now()
          where anggota_ref=$4 and koperasi_ref=$5`,
        [templatesTotal, coverageComplete, demoHash, id, session.koperasiRef],
      )
      return NextResponse.json({
        ok: true,
        enrollment: {
          mode: 'demo', templatesTotal, target: demoTarget, coverageComplete, demoCode,
          message: coverageComplete ? 'Enrol simulasi selesai. Gunakan kode simulasi untuk mencoba verifikasi.' : 'Tap simulasi tersimpan. Lanjutkan sampai cakupan penuh.',
        },
      })
    }

    const agentUrl = (process.env.FINGERPRINT_AGENT_URL || defaultAgentUrl).replace(/\/$/, '')
    const captureResponse = await fetch(`${agentUrl}/capture-tap`, { method: 'POST', signal: AbortSignal.timeout(20_000) })
    const capture = await captureResponse.json()
    if (!captureResponse.ok || !capture.frame) {
      return NextResponse.json({ error: capture.error || 'Sensor CS9711 belum mengirim frame. Tempelkan jari dan pastikan perangkat terdeteksi oleh agent.' }, { status: 502 })
    }

    const enrollResponse = await fetch(`${agentUrl}/station/enroll-tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: id, image: capture.frame }),
      signal: AbortSignal.timeout(20_000),
    })
    const enrollment = await enrollResponse.json()
    if (!enrollResponse.ok) {
      const error = enrollResponse.status === 404
        ? 'Agent sidik jari belum mendukung enrol stasiun. Restart npm run agent dari proyek SAKTI-MerahPutih yang terbaru.'
        : enrollment.error || 'Matcher menolak frame sidik jari.'
      return NextResponse.json({ error }, { status: 502 })
    }

    if (enrollment.coverageComplete) {
      await cloudQuery(
        `update app_member_profile set fingerprint_mode='station', fingerprint_enrollment_taps=$1, fingerprint_enrolled_at=now(), diperbarui_pada=now() where anggota_ref=$2 and koperasi_ref=$3`,
        [enrollment.templatesTotal || 0, id, session.koperasiRef],
      )
    }
    return NextResponse.json({ ok: true, enrollment: { ...enrollment, mode: 'station' } })
  } catch (error) {
    const message = error instanceof Error && error.name === 'TimeoutError'
      ? 'Waktu tunggu sensor habis. Pastikan jari menempel dan agent CS9711 berjalan.'
      : 'Agent sidik jari tidak dapat dihubungi. Jalankan npm run agent pada komputer sensor.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
