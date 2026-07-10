'use client'

import { User, MapPin, Briefcase } from 'lucide-react'

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

interface KtpCardProps {
  ktp: KtpData
}

export default function KtpCard({ ktp }: KtpCardProps) {
  const formatNIK = (nik: string) => {
    return nik.replace(/(.{4})/g, '$1.').slice(0, -1)
  }

  const formatTTL = (tempat: string, tanggal: string) => {
    const date = new Date(tanggal)
    const formatted = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return `${tempat}, ${formatted}`
  }

  return (
    <div className="bg-gradient-to-br from-white to-surface rounded-xl shadow-lg border-2 border-primary overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">KARTU TANDA PENDUDUK</h3>
            <p className="text-xs opacity-90">Republik Indonesia</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">RFID UID</p>
            <p className="font-mono font-semibold">{ktp.rfidUid}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* NIK */}
        <div className="pb-4 border-b border-border">
          <p className="text-xs text-text-secondary mb-1">NIK</p>
          <p className="text-2xl font-mono font-bold text-text-primary tracking-wider">
            {formatNIK(ktp.nik)}
          </p>
        </div>

        {/* Nama */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-text-secondary mb-1">Nama Lengkap</p>
            <p className="text-lg font-bold text-text-primary">{ktp.nama}</p>
          </div>
        </div>

        {/* TTL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-secondary mb-1">Tempat/Tanggal Lahir</p>
            <p className="text-sm font-medium text-text-primary">
              {formatTTL(ktp.tempatLahir, ktp.tanggalLahir)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Jenis Kelamin</p>
            <p className="text-sm font-medium text-text-primary">
              {ktp.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>
        </div>

        {/* Alamat */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-text-secondary mb-1">Alamat</p>
            <p className="text-sm font-medium text-text-primary">{ktp.alamat}</p>
            <p className="text-xs text-text-secondary mt-1">
              RT/RW {ktp.rtRw}
            </p>
            <p className="text-sm text-text-primary mt-1">
              Kel. {ktp.kelurahan}, Kec. {ktp.kecamatan}
            </p>
            <p className="text-sm text-text-primary">
              {ktp.kabupaten}, {ktp.provinsi}
            </p>
          </div>
        </div>

        {/* Info Lainnya */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-text-secondary mb-1">Agama</p>
            <p className="text-sm font-medium text-text-primary">{ktp.agama}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Status Perkawinan</p>
            <p className="text-sm font-medium text-text-primary">{ktp.statusPerkawinan}</p>
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Pekerjaan</p>
                <p className="text-sm font-medium text-text-primary">{ktp.pekerjaan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
