import { prisma } from '@/lib/prisma'
import { findMember } from '@/lib/cloud-db'
import { ArrowLeft, User, MapPin, Briefcase, Phone, Mail, Calendar, CreditCard, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getKoperasiId } from '@/lib/auth'
import DeleteMemberButton from '@/components/DeleteMemberButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function DetailAnggotaPage({ params }: PageProps) {
  const koperasiId = await getKoperasiId()
  
  if (!koperasiId) {
    redirect('/login')
  }

  const { id } = await params

  const cloudMember = await findMember(id, koperasiId)
  const ktpRecord = cloudMember ? await prisma.ktpRecord.findUnique({ where: { nik: cloudMember.nik } }) : null
  const member = cloudMember ? { id: cloudMember.anggota_ref, memberId: cloudMember.anggota_ref, nik: cloudMember.nik, nama: cloudMember.nama, foto: cloudMember.foto || '', phone: cloudMember.phone || '-', email: cloudMember.email, status: cloudMember.status_keanggotaan || 'Tidak Aktif', tanggalDaftar: cloudMember.tanggal_terdaftar || new Date(), ktpRecord } : null

  if (!member) {
    notFound()
  }

  const formatNIK = (nik: string) => nik.replace(/(.{4})/g, '$1.').slice(0, -1)

  const formatTTL = (tempat: string, tanggal: Date) => {
    const formatted = new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return `${tempat}, ${formatted}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/anggota"
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Detail Anggota</h1>
            <p className="text-text-secondary mt-1">Informasi lengkap anggota koperasi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/anggota/${member.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
          >
            <Pencil className="w-5 h-5" />
            Edit
          </Link>
          <Link
            href={`/anggota/${member.id}/kartu`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <CreditCard className="w-5 h-5" />
            Cetak Kartu
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="bg-primary p-6 text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                {member.foto ? (
                  <img src={member.foto} alt={member.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface flex items-center justify-center">
                    <User className="w-16 h-16 text-text-secondary" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-text-primary mb-1">{member.nama}</h2>
              <p className="text-sm font-mono text-primary mb-3">{member.memberId}</p>
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                  member.status === 'Aktif'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Informasi Kontak</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-text-secondary">Telepon</p>
                  <p className="text-sm font-medium text-text-primary">{member.phone}</p>
                </div>
              </div>
              {member.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm font-medium text-text-primary">{member.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-text-secondary">Tanggal Daftar</p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(member.tanggalDaftar).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-6">Data Kependudukan (KTP)</h3>
            
            <div className="space-y-6">
              <div className="pb-4 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-text-secondary">NIK</p>
                </div>
                <p className="text-2xl font-mono font-bold text-text-primary tracking-wider">
                  {formatNIK(member.nik)}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Tempat/Tanggal Lahir</p>
                  <p className="text-sm font-medium text-text-primary">
                    {member.ktpRecord ? formatTTL(member.ktpRecord.tempatLahir, member.ktpRecord.tanggalLahir) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Jenis Kelamin</p>
                  <p className="text-sm font-medium text-text-primary">
                    {member.ktpRecord ? (member.ktpRecord.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Agama</p>
                  <p className="text-sm font-medium text-text-primary">{member.ktpRecord?.agama || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Status Perkawinan</p>
                  <p className="text-sm font-medium text-text-primary">
                    {member.ktpRecord?.statusPerkawinan || '-'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-xs text-text-secondary">Pekerjaan</p>
                      <p className="text-sm font-medium text-text-primary">
                        {member.ktpRecord?.pekerjaan || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Alamat</p>
                  </div>
                </div>
                <div className="ml-7 space-y-1">
                  <p className="text-sm text-text-primary">{member.ktpRecord?.alamat || '-'}</p>
                  <p className="text-sm text-text-secondary">RT/RW {member.ktpRecord?.rtRw || '-'}</p>
                  <p className="text-sm text-text-primary">
                    Kel. {member.ktpRecord?.kelurahan || '-'}
                  </p>
                  <p className="text-sm text-text-primary">
                    Kec. {member.ktpRecord?.kecamatan || '-'}
                  </p>
                  <p className="text-sm text-text-primary">
                    {member.ktpRecord?.kabupaten || '-'}, {member.ktpRecord?.provinsi || '-'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-secondary mb-1">RFID UID (KTP)</p>
                <p className="text-sm font-mono font-medium text-text-primary">
                  {member.ktpRecord?.rfidUid || '-'}
                </p>
              </div>

            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/anggota"
              className="px-6 py-3 border-2 border-border text-text-primary rounded-lg hover:bg-surface transition-colors font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Daftar
            </Link>
            <DeleteMemberButton
              memberId={member.id}
              memberName={member.nama}
              redirectAfter="/anggota"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
