'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

interface KoperasiInfo {
  nama: string
}

interface UserData {
  nama: string
  role: string
  koperasi: KoperasiInfo
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data.user))
        .catch(() => {})
    }
  }, [])

  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            {user?.koperasi?.nama || 'Koperasi'}
          </h2>
          <p className="text-sm text-text-secondary">
            Sistem Pendaftaran Anggota Terintegrasi
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user.nama}</p>
              <p className="text-xs text-text-secondary">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
