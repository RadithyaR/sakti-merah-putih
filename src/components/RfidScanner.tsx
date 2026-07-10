'use client'

import { useState, useRef, useEffect } from 'react'
import { Wifi, Loader2, AlertCircle } from 'lucide-react'

interface KtpData {
  nik: string
  nama: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  alamat: string
  rtRw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  agama: string
  statusPerkawinan: string
  pekerjaan: string
  rfidUid: string
}

interface RfidScannerProps {
  onKtpFound: (ktp: KtpData) => void
  onError: (error: string) => void
}

export default function RfidScanner({ onKtpFound, onError }: RfidScannerProps) {
  const [rfidUid, setRfidUid] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus input field for RFID reader
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleScan = async () => {
    if (!rfidUid.trim()) {
      onError('RFID UID tidak boleh kosong')
      return
    }

    setLoading(true)
    setScanning(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/ktp/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rfidUid: rfidUid.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Data KTP tidak ditemukan')
      }

      onKtpFound(data.ktp)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
      setScanning(false)
    }
  }

  const handleSimulateScan = async () => {
    setLoading(true)
    setScanning(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/rfid/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Simulasi scan gagal')
      }

      setRfidUid(data.ktp.rfidUid)
      onKtpFound(data.ktp)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
      setScanning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // RFID reader typically sends Enter key after UID
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${scanning ? 'bg-yellow-100' : 'bg-primary/10'}`}>
          <Wifi className={`w-6 h-6 ${scanning ? 'text-yellow-600 animate-pulse' : 'text-primary'}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">RFID Scanner</h3>
          <p className="text-sm text-text-secondary">
            {scanning ? 'Membaca kartu...' : 'Tap kartu RFID atau input UID manual'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="rfidUid" className="block text-sm font-medium text-text-primary mb-2">
            RFID UID
          </label>
          <input
            ref={inputRef}
            id="rfidUid"
            type="text"
            value={rfidUid}
            onChange={(e) => setRfidUid(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
            placeholder="Contoh: RFID-0001-A001"
            disabled={loading}
          />
          <p className="text-xs text-text-secondary mt-2">
            💡 Tip: Input akan auto-focus. Tap kartu RFID atau ketik UID lalu tekan Enter
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleScan}
            disabled={loading || !rfidUid.trim()}
            className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5" />
                Scan Kartu
              </>
            )}
          </button>

          <button
            onClick={handleSimulateScan}
            disabled={loading}
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simulasi
          </button>
        </div>
      </div>
    </div>
  )
}
