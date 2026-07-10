'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="p-6 border-t border-border flex items-center justify-between">
      <p className="text-sm text-text-secondary">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={createPageURL(Math.max(1, currentPage - 1))}
          className={`px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors ${
            currentPage === 1 ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          ← Sebelumnya
        </Link>
        <Link
          href={createPageURL(Math.min(totalPages, currentPage + 1))}
          className={`px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors ${
            currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          Selanjutnya →
        </Link>
      </div>
    </div>
  )
}
