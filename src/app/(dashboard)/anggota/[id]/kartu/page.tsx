import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getKoperasiId } from '@/lib/auth'
import { formatNIK } from '@/lib/utils'
import MemberCard from '@/components/MemberCard'
import CardPrintActions from '@/components/CardPrintActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function KartuAnggotaPage({ params }: PageProps) {
  const koperasiId = await getKoperasiId()

  if (!koperasiId) {
    redirect('/login')
  }

  const { id } = await params

  const member = await prisma.member.findFirst({
    where: { id: parseInt(id), koperasiId },
    include: { koperasi: true },
  })

  if (!member) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Saat print: sembunyikan seluruh dashboard, tampilkan hanya area kartu */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body * { visibility: hidden; }
          .card-print-area, .card-print-area * { visibility: visible; }
          .card-print-area {
            position: fixed;
            inset: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 20mm;
            background: white;
          }
        }
      `}</style>

      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href={`/anggota/${member.id}`}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Kartu Anggota</h1>
            <p className="text-text-secondary mt-1">
              {member.nama} · {member.memberId}
            </p>
          </div>
        </div>
        <CardPrintActions memberId={member.id} />
      </div>

      <div className="card-print-area bg-white rounded-xl shadow-sm border border-border p-8">
        <MemberCard
          member={{
            nama: member.nama,
            nik: formatNIK(member.nik),
            namaKoperasi: member.koperasi.nama,
            kodeKoperasi: member.koperasi.kode,
          }}
        />
      </div>

      <div className="bg-surface rounded-xl p-4 text-sm text-text-secondary print:hidden">
        Ukuran kartu mengikuti standar CR80 (54 × 85.6 mm). Saat mencetak, pastikan opsi
        <span className="font-semibold"> “Background graphics”</span> aktif dan skala di
        <span className="font-semibold"> 100%</span> agar warna serta ukuran presisi.
      </div>
    </div>
  )
}
