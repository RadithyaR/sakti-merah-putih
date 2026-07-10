import { prisma } from '@/lib/prisma'
import { Users, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'
import Pagination from '@/components/Pagination'
import DeleteMemberButton from '@/components/DeleteMemberButton'
import { getKoperasiId } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic'

export default async function AnggotaPage({ searchParams }: PageProps) {
  const koperasiId = await getKoperasiId()
  
  if (!koperasiId) {
    redirect('/login')
  }

  const params = await searchParams
  const search = (params.search as string) || ''
  const status = (params.status as string) || ''
  const page = parseInt((params.page as string) || '1', 10)
  const limit = 10

  const where: Record<string, unknown> = { koperasiId }

  if (search) {
    where.OR = [
      { nama: { contains: search } },
      { nik: { contains: search } },
    ]
  }

  if (status) {
    where.status = status
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { tanggalDaftar: 'desc' },
      select: {
        id: true,
        memberId: true,
        nik: true,
        nama: true,
        foto: true,
        phone: true,
        tanggalDaftar: true,
        status: true,
      },
    }),
    prisma.member.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Daftar Anggota</h1>
          <p className="text-text-secondary mt-1">Kelola data anggota koperasi</p>
        </div>
        <Link
          href="/pendaftaran"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center gap-2"
        >
          <Users className="w-5 h-5" />
          Tambah Anggota
        </Link>
      </div>

      <SearchFilter />

      <div className="bg-white rounded-xl shadow-sm border border-border">
        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-border mx-auto mb-4" />
            <p className="text-text-secondary mb-4">Tidak ada anggota ditemukan</p>
            <Link
              href="/pendaftaran"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              <Users className="w-5 h-5" />
              Daftarkan Anggota Baru
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Foto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      No. Anggota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      NIK
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface">
                          {member.foto ? (
                            <img
                              src={member.foto}
                              alt={member.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-text-secondary" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-text-primary">
                        {member.memberId}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-text-primary">
                        {member.nik}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">
                        {member.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(member.tanggalDaftar).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.status === 'Aktif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/anggota/${member.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Detail
                          </Link>
                          <Link
                            href={`/anggota/${member.id}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Link>
                          <DeleteMemberButton
                            memberId={member.id}
                            memberName={member.nama}
                            variant="row"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
          </>
        )}
      </div>
    </div>
  )
}
