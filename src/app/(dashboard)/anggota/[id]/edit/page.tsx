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
      nama: true,
      phone: true,
      email: true,
      status: true,
    },
  })

  if (!member) {
    notFound()
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

      <div className="max-w-xl">
        <EditMemberForm member={member} />
      </div>
    </div>
  )
}
