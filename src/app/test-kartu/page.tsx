import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PublicMemberCardTest from '@/components/PublicMemberCardTest'

export const dynamic = 'force-dynamic'

export default function TestKartuPage() {
  return (
    <main className="min-h-screen bg-surface px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"><ArrowLeft className="h-4 w-4" />Kembali ke beranda</Link>
        <div className="mt-8 mb-6"><h1 className="text-3xl font-bold text-text-primary">Test Kartu Anggota</h1><p className="mt-2 text-text-secondary">Verifikasi kartu tanpa login dengan informasi keanggotaan yang aman.</p></div>
        <PublicMemberCardTest />
      </div>
    </main>
  )
}
