import { cloudQuery } from '@/lib/cloud-db'
import { Users, UserPlus, UserCheck, UserX, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getKoperasiId } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const koperasiId = await getKoperasiId()
  
  if (!koperasiId) {
    redirect('/login')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [counts, recent] = await Promise.all([
    cloudQuery<{ total: string; active: string; inactive: string; monthly: string }>(`
      select count(*) as total,
             count(*) filter (where status_keanggotaan = 'Aktif') as active,
             count(*) filter (where status_keanggotaan <> 'Aktif') as inactive,
             count(*) filter (where tanggal_terdaftar >= $2::date) as monthly
        from anggota_koperasi
       where koperasi_ref = $1`, [koperasiId, startOfMonth.toISOString().slice(0, 10)]),
    cloudQuery<{ id: string; memberId: string; nama: string; tanggalDaftar: Date | null; status: string | null }>(`
      select anggota_ref as id, anggota_ref as "memberId", nama,
             tanggal_terdaftar as "tanggalDaftar", status_keanggotaan as status
        from anggota_koperasi
       where koperasi_ref = $1
       order by tanggal_terdaftar desc nulls last
       limit 5`, [koperasiId]),
  ])
  const totalMembers = Number(counts.rows[0].total)
  const activeMembers = Number(counts.rows[0].active)
  const inactiveMembers = Number(counts.rows[0].inactive)
  const newThisMonth = Number(counts.rows[0].monthly)
  const recentMembers = recent.rows

  const stats = [
    {
      title: 'Total Anggota',
      value: totalMembers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Anggota Baru Bulan Ini',
      value: newThisMonth,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Anggota Aktif',
      value: activeMembers,
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      title: 'Anggota Nonaktif',
      value: inactiveMembers,
      icon: UserX,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Ringkasan data anggota koperasi</p>
        </div>
        <Link
          href="/pendaftaran"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Anggota Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">Anggota Terbaru</h2>
          <p className="text-sm text-text-secondary mt-1">5 anggota terakhir terdaftar</p>
        </div>

        {recentMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-border mx-auto mb-4" />
            <p className="text-text-secondary mb-4">Belum ada anggota terdaftar</p>
            <Link
              href="/pendaftaran"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              <UserPlus className="w-5 h-5" />
              Daftarkan Anggota Pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    No. Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Tanggal Daftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-text-primary">
                      {member.memberId}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {member.nama}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {member.tanggalDaftar ? new Date(member.tanggalDaftar).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'Aktif'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {member.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
