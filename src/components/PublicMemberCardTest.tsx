'use client'

import { useState } from 'react'
import { CheckCircle, CreditCard, MapPin, Search, UserRound } from 'lucide-react'

type PublicMember = {
  memberId: string
  nama: string
  namaKoperasi: string
  lokasiKeanggotaan: string | null
}

export default function PublicMemberCardTest() {
  const [identifier, setIdentifier] = useState('')
  const [member, setMember] = useState<PublicMember | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const verify = async (event: React.FormEvent) => {
    event.preventDefault()
    const value = identifier.trim()
    if (!value) return
    setLoading(true)
    setError('')
    setMember(null)
    try {
      const params = /^\d{10}$/.test(value)
        ? new URLSearchParams({ cardUid: value })
        : new URLSearchParams({ memberId: value })
      const response = await fetch(`/api/public/member-card?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Kartu tidak dapat diverifikasi.')
      setMember(data.member)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat memeriksa kartu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={verify} className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-3"><CreditCard className="h-6 w-6 text-primary" /></div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Uji Kartu Anggota</h2>
            <p className="mt-1 text-sm text-text-secondary">Tap atau ketik UID kartu 10 digit. Nomor anggota juga dapat dipakai untuk pengujian.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value.replace(/[^0-9A-Za-z-]/g, '').slice(0, 32))}
            inputMode="text"
            autoFocus
            placeholder="UID 10 digit atau ANG-..."
            className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" disabled={loading || !identifier.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Search className="h-5 w-5" />
            {loading ? 'Memeriksa...' : 'Test Kartu'}
          </button>
        </div>
      </form>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {member && (
        <section className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-700"><CheckCircle className="h-5 w-5" /><p className="font-semibold">Kartu anggota valid</p></div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><dt className="flex items-center gap-2 text-xs text-text-secondary"><UserRound className="h-4 w-4" />Nama</dt><dd className="mt-1 font-semibold text-text-primary">{member.nama}</dd></div>
            <div><dt className="text-xs text-text-secondary">Nomor Anggota</dt><dd className="mt-1 font-mono font-semibold text-text-primary">{member.memberId}</dd></div>
            <div className="sm:col-span-2"><dt className="flex items-center gap-2 text-xs text-text-secondary"><MapPin className="h-4 w-4" />Keanggotaan</dt><dd className="mt-1 font-semibold text-text-primary">{member.namaKoperasi}</dd><dd className="mt-1 text-sm text-text-secondary">{member.lokasiKeanggotaan || 'Lokasi koperasi belum tersedia'}</dd></div>
          </dl>
          <p className="mt-6 border-t border-border pt-4 text-xs text-text-secondary">Halaman ini sengaja tidak menampilkan NIK, nomor telepon, email, foto, data KTP, UID kartu, atau informasi internal koperasi.</p>
        </section>
      )}
    </div>
  )
}
