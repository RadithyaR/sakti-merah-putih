/**
 * Kartu Anggota Koperasi (KDMP Card) — ukuran fisik CR80 portrait (54 × 85.6 mm).
 * Semua dimensi memakai satuan mm/pt agar hasil cetak presisi tanpa scaling.
 * Desain mengikuti templat resmi: sisi depan putih ber-aksen merah #b8001c,
 * sisi belakang full-bleed templat KDMP Card.
 */

const CARD_RED = '#b8001c'

interface MemberCardData {
  nama: string
  nik: string
  namaKoperasi: string
  kodeKoperasi: string
}

interface MemberCardProps {
  member: MemberCardData
}

export function MemberCardFront({ member }: MemberCardProps) {
  return (
    <div
      className="member-card relative overflow-hidden bg-white"
      style={{
        width: '54mm',
        height: '85.6mm',
        borderRadius: '2.7mm',
        border: '1px solid #dee2e6',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Bar merah tipis di tepi atas */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: '0.5mm', background: CARD_RED }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center text-center"
        style={{ padding: '6mm 4.7mm 19.6mm', gap: '1.7mm' }}
      >
        <img
          src="/card/logo-kopdes.png"
          alt="Logo Koperasi Desa Merah Putih"
          style={{ width: '21.6mm', height: 'auto', objectFit: 'contain', marginBottom: '1mm' }}
        />

        <div
          className="uppercase"
          style={{
            fontWeight: 800,
            fontSize: '8.1pt',
            lineHeight: 1.25,
            color: CARD_RED,
            letterSpacing: '0.01em',
          }}
        >
          {member.namaKoperasi}
        </div>

        <div style={{ fontWeight: 400, fontSize: '6pt', lineHeight: 1.4, color: '#1a1a1a' }}>
          {member.kodeKoperasi}
        </div>

        <div style={{ width: '84%', height: '0.35mm', background: CARD_RED, marginTop: '1mm' }} />

        <div className="flex-1" />

        <div className="w-full text-left flex flex-col" style={{ gap: '0.4mm' }}>
          <div style={{ fontWeight: 700, fontSize: '9.1pt', lineHeight: 1.25, color: '#1a1a1a' }}>
            {member.nama}
          </div>
          <div
            style={{
              fontWeight: 400,
              fontSize: '6.7pt',
              lineHeight: 1.3,
              color: '#1a1a1a',
              letterSpacing: '0.02em',
            }}
          >
            {member.nik}
          </div>
        </div>
      </div>

      {/* Ribbon merah di tepi bawah kartu */}
      <img
        src="/card/ribbon.png"
        alt=""
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{ display: 'block' }}
      />
    </div>
  )
}

export function MemberCardBack() {
  return (
    <div
      className="member-card overflow-hidden"
      style={{
        width: '54mm',
        height: '85.6mm',
        borderRadius: '2.7mm',
        border: '1px solid #dee2e6',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <img
        src="/card/card-back.png"
        alt="Templat belakang kartu anggota"
        className="w-full h-full object-cover"
        style={{ display: 'block' }}
      />
    </div>
  )
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="flex flex-wrap justify-center items-start" style={{ gap: '8mm' }}>
      <MemberCardFront member={member} />
      <MemberCardBack />
    </div>
  )
}
