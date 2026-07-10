'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'

interface EditMemberFormProps {
  member: {
    id: number
    nama: string
    phone: string
    email: string | null
    status: string
  }
}

export default function EditMemberForm({ member }: EditMemberFormProps) {
  const router = useRouter()
  const [nama, setNama] = useState(member.nama)
  const [phone, setPhone] = useState(member.phone)
  const [email, setEmail] = useState(member.email ?? '')
  const [status, setStatus] = useState(member.status)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nama, phone, email, status }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui data anggota')
      }

      router.push(`/anggota/${member.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 shadow-sm border border-border space-y-5"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Nomor Telepon
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Email (opsional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        >
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Simpan Perubahan
        </button>
      </div>
    </form>
  )
}
