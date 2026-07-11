'use client'

import { useState } from 'react'
import { CheckCircle, CreditCard, Mail, MapPin, Phone, UserRound } from 'lucide-react'

type Member = {
  memberId: string; nama: string; nik: string; status: string | null; phone: string | null; email: string | null
  namaKoperasi: string | null; lokasiKeanggotaan: string | null; rfidUid: string | null; pekerjaan: string | null
}

export default function DashboardMemberCardTest() {
  const [cardUid, setCardUid] = useState('')
  const [member, setMember] = useState<Member | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testCard = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true); setError(''); setMember(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/members/card-test', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ cardUid }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Kartu tidak dapat diperiksa.')
      setMember(data.member)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat memeriksa kartu.') } finally { setLoading(false) }
  }

  return <div className="space-y-6"><form onSubmit={testCard} className="rounded-lg border border-border bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-lg bg-primary/10 p-3"><CreditCard className="h-6 w-6 text-primary" /></div><div><h2 className="text-xl font-bold text-text-primary">Test Kartu Anggota Koperasi</h2><p className="mt-1 text-sm text-text-secondary">Tap atau ketik UID kartu anggota 10 digit. Hanya kartu anggota koperasi Anda yang dapat dibuka.</p></div></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={cardUid} onChange={(event) => setCardUid(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" maxLength={10} autoFocus placeholder="0013910654" className="min-w-0 flex-1 rounded-lg border border-border px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary" /><button type="submit" disabled={loading || cardUid.length !== 10} className="rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Memeriksa...' : 'Test Kartu'}</button></div></form>{error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}{member && <section className="rounded-lg border border-green-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-green-700"><CheckCircle className="h-5 w-5" /><p className="font-semibold">Kartu valid untuk koperasi Anda</p></div><dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="flex items-center gap-2 text-xs text-text-secondary"><UserRound className="h-4 w-4" />Nama</dt><dd className="mt-1 font-semibold text-text-primary">{member.nama}</dd></div><div><dt className="text-xs text-text-secondary">Nomor Anggota</dt><dd className="mt-1 font-mono font-semibold text-text-primary">{member.memberId}</dd></div><div><dt className="text-xs text-text-secondary">NIK</dt><dd className="mt-1 font-mono text-text-primary">{member.nik}</dd></div><div><dt className="text-xs text-text-secondary">Status</dt><dd className="mt-1 text-text-primary">{member.status || '-'}</dd></div><div className="sm:col-span-2"><dt className="flex items-center gap-2 text-xs text-text-secondary"><MapPin className="h-4 w-4" />Koperasi dan lokasi</dt><dd className="mt-1 font-semibold text-text-primary">{member.namaKoperasi || '-'}</dd><dd className="mt-1 text-sm text-text-secondary">{member.lokasiKeanggotaan || '-'}</dd></div><div><dt className="flex items-center gap-2 text-xs text-text-secondary"><Phone className="h-4 w-4" />Telepon</dt><dd className="mt-1 text-text-primary">{member.phone || '-'}</dd></div><div><dt className="flex items-center gap-2 text-xs text-text-secondary"><Mail className="h-4 w-4" />Email</dt><dd className="mt-1 break-all text-text-primary">{member.email || '-'}</dd></div><div><dt className="text-xs text-text-secondary">RFID KTP</dt><dd className="mt-1 font-mono text-text-primary">{member.rfidUid || '-'}</dd></div><div><dt className="text-xs text-text-secondary">Pekerjaan</dt><dd className="mt-1 text-text-primary">{member.pekerjaan || '-'}</dd></div></dl></section>}</div>
}
