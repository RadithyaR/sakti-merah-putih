'use client'

import { useState, useRef, useEffect } from 'react'
import { CreditCard, Loader2, SkipForward } from 'lucide-react'

interface KopdesCardScannerProps {
  onSaved: (cardUid: string) => void
  onSkip: () => void
}

export default function KopdesCardScanner({ onSaved, onSkip }: KopdesCardScannerProps) {
  const [cardUid, setCardUid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = async () => {
    if (!cardUid.trim()) {
      setError('UID kartu tidak boleh kosong')
      return
    }

    setLoading(true)
    setError('')

    try {
      onSaved(cardUid.trim())
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Kartu RFID Kopdes juga terbaca sebagai keyboard (HID), diakhiri Enter
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Kartu Kopdes</h3>
          <p className="text-sm text-text-secondary">
            Tap kartu anggota Kopdes fisik ke reader untuk menautkan UID-nya
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="cardUid"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            UID Kartu Kopdes
          </label>
          <input
            ref={inputRef}
            id="cardUid"
            type="text"
            value={cardUid}
            onChange={(e) => setCardUid(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
            placeholder="Contoh: KOPDES-0001-A1B2"
            disabled={loading}
          />
          <p className="text-xs text-text-secondary mt-2">
            💡 Input akan auto-focus. Tap kartu Kopdes atau ketik UID lalu tekan Enter.
            Ke depannya, kartu ini dipakai untuk verifikasi anggota — menggantikan
            scan KTP setelah pendaftaran awal.
          </p>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 border-2 border-border text-text-primary rounded-lg hover:bg-surface transition-colors font-semibold disabled:opacity-50"
          >
            <SkipForward className="w-5 h-5" />
            Lewati untuk Saat Ini
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !cardUid.trim()}
            className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Simpan & Lanjutkan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
