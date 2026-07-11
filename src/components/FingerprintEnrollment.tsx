'use client'

import { useState } from 'react'
import { Fingerprint, Loader2, SkipForward } from 'lucide-react'

interface FingerprintEnrollmentProps {
  memberId: string
  onComplete: (demoCode?: string) => void
  onSkip: () => void
}

type EnrollResult = {
  mode?: 'demo' | 'station'
  templatesTotal?: number
  target?: number
  coverageComplete?: boolean
  demoCode?: string
  message?: string
}

export default function FingerprintEnrollment({ memberId, onComplete, onSkip }: FingerprintEnrollmentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EnrollResult>({})

  const captureTap = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members/${memberId}/fingerprint/tap`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gagal merekam sidik jari')

      const next = data.enrollment as EnrollResult
      setResult(next)
      if (next.coverageComplete) onComplete(next.demoCode)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat merekam sidik jari')
    } finally {
      setLoading(false)
    }
  }

  const target = result.target || 15
  const total = result.templatesTotal || 0

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <Fingerprint className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Enrol Sidik Jari</h3>
          <p className="text-sm text-text-secondary">Simulasi aman untuk pengujian Cloud Run, tanpa gambar atau template biometrik.</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface p-4 mb-4">
        <p className="font-medium text-text-primary">Tekan Rekam Tap untuk mensimulasikan satu pembacaan sidik jari.</p>
        <p className="text-sm text-text-secondary mt-1">Tidak ada citra sidik jari, minutiae, atau template biometrik yang dikirim maupun disimpan.</p>
        <p className="text-sm font-mono text-primary mt-3">Cakupan: {total} / {target} tap</p>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {result.message && <p className="text-sm text-green-700 mb-4">{result.message}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onSkip} disabled={loading} className="flex items-center gap-2 px-6 py-3 border-2 border-border text-text-primary rounded-lg hover:bg-surface transition-colors font-semibold disabled:opacity-50">
          <SkipForward className="w-5 h-5" />
          Lewati untuk Saat Ini
        </button>
        <button type="button" onClick={captureTap} disabled={loading} className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Merekam...</> : <><Fingerprint className="w-5 h-5" />Simulasikan Tap</>}
        </button>
      </div>
    </div>
  )
}
