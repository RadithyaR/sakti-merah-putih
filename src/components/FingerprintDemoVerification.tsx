'use client'

import { useState } from 'react'
import { CheckCircle, Fingerprint, XCircle } from 'lucide-react'

export default function FingerprintDemoVerification({ memberId, issuedCode }: { memberId: string; issuedCode?: string }) {
  const [demoCode, setDemoCode] = useState(issuedCode || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ matched: boolean; message: string } | null>(null)
  const [error, setError] = useState('')

  const verify = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members/${memberId}/fingerprint/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ demoCode }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Verifikasi gagal')
      setResult(data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat verifikasi')
    } finally { setLoading(false) }
  }

  return (
    <div className="mt-6 text-left rounded-lg border border-border p-5">
      <div className="flex gap-3"><Fingerprint className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div><p className="font-semibold text-text-primary">Uji Verifikasi Sidik Jari</p><p className="text-sm text-text-secondary">Masukkan kode simulasi enam digit. Ini hanya menguji alur Cloud Run, bukan biometrik asli.</p></div></div>
      {issuedCode && <p className="mt-4 rounded bg-surface p-3 text-sm text-text-primary">Kode simulasi enrol ini: <span className="font-mono font-bold">{issuedCode}</span></p>}
      <div className="mt-4 flex gap-3"><input value={demoCode} onChange={(event) => setDemoCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="000000" className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary" /><button type="button" onClick={verify} disabled={loading || demoCode.length !== 6} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Memeriksa...' : 'Verifikasi'}</button></div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${result.matched ? 'text-green-700' : 'text-red-600'}`}>{result.matched ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}{result.message}</p>}
    </div>
  )
}
