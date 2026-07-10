import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getKoperasiId } from '@/lib/auth'
import EditMemberForm from '@/components/EditMemberForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditAnggotaPage({ params }: PageProps) {
  const koperasiId = await getKoperasiId()

  if (!koperasiId) {
    redirect('/login')
  }

  const { id } = await params

  const member = await prisma.member.findFirst({
    where: { id: parseInt(id), koperasiId },
    select: {
      id: true,
      memberId: true,
      nik: true,
      nama: true,
      foto: true,
      phone: true,
      email: true,
      status: true,
      tanggalDaftar: true,
      ktpRecord: {
        select: {
          tempatLahir: true,
          tanggalLahir: true,
          jenisKelamin: true,
          alamat: true,
          rtRw: true,
          kelurahan: true,
          kecamatan: true,
          kabupaten: true,
          provinsi: true,
          agama: true,
          statusPerkawinan: true,
          pekerjaan: true,
          rfidUid: true,
        },
      },
    },
  })

  if (!member) {
    notFound()
  }

  const formMember = {
    id: member.id,
    nik: member.nik,
    nama: member.nama,
    foto: member.foto,
    phone: member.phone,
    email: member.email,
    status: member.status,
    tanggalDaftar: member.tanggalDaftar.toISOString(),
    ktpRecord: {
      ...member.ktpRecord,
      tanggalLahir: member.ktpRecord.tanggalLahir.toISOString(),
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/anggota/${member.id}`}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Edit Anggota</h1>
          <p className="text-text-secondary mt-1">
            {member.nama} · {member.memberId}
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <EditMemberForm member={formMember} />
      </div>
    </div>
  )
}
