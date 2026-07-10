'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteMemberButtonProps {
  memberId: number
  memberName: string
  redirectAfter?: string
  variant?: 'button' | 'row'
}

export default function DeleteMemberButton({
  memberId,
  memberName,
  redirectAfter,
  variant = 'button',
}: DeleteMemberButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Hapus data anggota "${memberName}"? Tindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal menghapus anggota')
      }

      if (redirectAfter) {
        router.push(redirectAfter)
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  if (variant === 'row') {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Hapus
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-semibold disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
      Hapus Anggota
    </button>
  )
}
