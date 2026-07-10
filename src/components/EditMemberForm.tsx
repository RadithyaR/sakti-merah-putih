'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Camera } from 'lucide-react'
import WebcamCapture from './WebcamCapture'

interface EditMemberFormProps {
  member: {
    id: number
    nik: string
    nama: string
    foto: string
    phone: string
    email: string | null
    status: string
    tanggalDaftar: string
    kopdesCardUid: string | null
    ktpRecord: {
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
  }
}

const toDateInput = (value: string) => (value ? value.slice(0, 10) : '')

export default function EditMemberForm({ member }: EditMemberFormProps) {
  const router = useRouter()

  // Data anggota
  const [nama, setNama] = useState(member.nama)
  const [phone, setPhone] = useState(member.phone)
  const [email, setEmail] = useState(member.email ?? '')
  const [status, setStatus] = useState(member.status)
  const [tanggalDaftar, setTanggalDaftar] = useState(toDateInput(member.tanggalDaftar))
  const [foto, setFoto] = useState(member.foto)
  const [showCamera, setShowCamera] = useState(false)
  const [kopdesCardUid, setKopdesCardUid] = useState(member.kopdesCardUid ?? '')

  // Data kependudukan (KTP)
  const k = member.ktpRecord
  const [tempatLahir, setTempatLahir] = useState(k.tempatLahir)
  const [tanggalLahir, setTanggalLahir] = useState(toDateInput(k.tanggalLahir))
  const [jenisKelamin, setJenisKelamin] = useState(k.jenisKelamin)
  const [alamat, setAlamat] = useState(k.alamat)
  const [rtRw, setRtRw] = useState(k.rtRw)
  const [kelurahan, setKelurahan] = useState(k.kelurahan)
  const [kecamatan, setKecamatan] = useState(k.kecamatan)
  const [kabupaten, setKabupaten] = useState(k.kabupaten)
  const [provinsi, setProvinsi] = useState(k.provinsi)
  const [agama, setAgama] = useState(k.agama)
  const [statusPerkawinan, setStatusPerkawinan] = useState(k.statusPerkawinan)
  const [pekerjaan, setPekerjaan] = useState(k.pekerjaan)

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
        body: JSON.stringify({
          nama,
          phone,
          email,
          status,
          foto,
          tanggalDaftar,
          kopdesCardUid,
          tempatLahir,
          tanggalLahir,
          jenisKelamin,
          alamat,
          rtRw,
          kelurahan,
          kecamatan,
          kabupaten,
          provinsi,
          agama,
          statusPerkawinan,
          pekerjaan,
        }),
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

  const inputClass =
    'w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none'
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-border space-y-5">
        <h3 className="text-lg font-bold text-text-primary">Data Anggota</h3>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface border border-border flex-shrink-0">
            {foto ? (
              <img src={foto} alt={nama} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
                Tidak ada foto
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCamera((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold text-sm"
          >
            <Camera className="w-4 h-4" />
            {showCamera ? 'Tutup Kamera' : 'Ganti Foto'}
          </button>
        </div>

        {showCamera && (
          <WebcamCapture
            onCapture={(imageData) => {
              setFoto(imageData)
              setShowCamera(false)
            }}
          />
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>NIK (tidak dapat diubah)</label>
            <input
              type="text"
              value={member.nik}
              disabled
              className={`${inputClass} bg-surface text-text-secondary cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={labelClass}>Nomor Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email (opsional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status Keanggotaan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Tanggal Terdaftar</label>
            <input
              type="date"
              value={tanggalDaftar}
              onChange={(e) => setTanggalDaftar(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-text-secondary mt-1">
              Berpengaruh pada kewajiban dan hak simpanan anggota. Pastikan tanggal benar.
            </p>
          </div>

          <div>
            <label className={labelClass}>UID Kartu Kopdes</label>
            <input
              type="text"
              value={kopdesCardUid}
              onChange={(e) => setKopdesCardUid(e.target.value)}
              placeholder="Belum ditautkan"
              className={`${inputClass} font-mono`}
            />
            <p className="text-xs text-text-secondary mt-1">
              Tautkan atau ganti kartu Kopdes fisik anggota (mis. kartu hilang/rusak).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-border space-y-5">
        <h3 className="text-lg font-bold text-text-primary">Data Kependudukan (KTP)</h3>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Jenis Kelamin</label>
            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              className={inputClass}
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Pekerjaan</label>
            <input
              type="text"
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tempat Lahir</label>
            <input
              type="text"
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tanggal Lahir</label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Agama</label>
            <input
              type="text"
              value={agama}
              onChange={(e) => setAgama(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status Perkawinan</label>
            <select
              value={statusPerkawinan}
              onChange={(e) => setStatusPerkawinan(e.target.value)}
              className={inputClass}
            >
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Kawin">Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div>
            <label className={labelClass}>Alamat</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className={labelClass}>RT/RW</label>
              <input
                type="text"
                value={rtRw}
                onChange={(e) => setRtRw(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kelurahan</label>
              <input
                type="text"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kecamatan</label>
              <input
                type="text"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kabupaten</label>
              <input
                type="text"
                value={kabupaten}
                onChange={(e) => setKabupaten(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Provinsi</label>
              <input
                type="text"
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>RFID UID (tidak dapat diubah)</label>
              <input
                type="text"
                value={k.rfidUid}
                disabled
                className={`${inputClass} bg-surface text-text-secondary cursor-not-allowed`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
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
