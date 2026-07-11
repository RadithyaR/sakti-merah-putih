import { redirect } from 'next/navigation'
import { getKoperasiId } from '@/lib/auth'
import DashboardMemberCardTest from '@/components/DashboardMemberCardTest'

export const dynamic = 'force-dynamic'

export default async function VerifikasiKartuPage() {
  if (!await getKoperasiId()) redirect('/login')
  return <div className="mx-auto max-w-4xl"><h1 className="text-3xl font-bold text-text-primary">Test Kartu Anggota</h1><p className="mt-1 text-text-secondary">Verifikasi kartu fisik dan lihat data lengkap anggota koperasi Anda.</p><div className="mt-6"><DashboardMemberCardTest /></div></div>
}
