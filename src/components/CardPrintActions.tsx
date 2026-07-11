'use client'

import { Printer, FileDown } from 'lucide-react'

interface CardPrintActionsProps {
  memberId: string
}

export default function CardPrintActions({ memberId }: CardPrintActionsProps) {
  return (
    <div className="flex items-center gap-3 print:hidden">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
      >
        <Printer className="w-5 h-5" />
        Cetak Kartu
      </button>
      <a
        href={`/api/members/${memberId}/card`}
        className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-surface transition-colors font-semibold"
      >
        <FileDown className="w-5 h-5" />
        Download PDF
      </a>
    </div>
  )
}
