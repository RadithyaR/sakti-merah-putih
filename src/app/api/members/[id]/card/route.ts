import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { findMember } from '@/lib/cloud-db'
import { getKoperasiId } from '@/lib/auth'
import { formatNIK } from '@/lib/utils'

// Ukuran fisik dalam point PDF (1 mm = 2.83465 pt)
const MM = 2.83465
const CARD_W = 54 * MM // 153.07 pt — CR80 portrait
const CARD_H = 85.6 * MM // 242.65 pt
const A4_W = 210 * MM
const A4_H = 297 * MM
const CARD_GAP = 8 * MM

const RED = rgb(0xb8 / 255, 0x00 / 255, 0x1c / 255)
const DARK = rgb(0x1a / 255, 0x1a / 255, 0x1a / 255)
const BORDER = rgb(0xde / 255, 0xe2 / 255, 0xe6 / 255)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const koperasiId = await getKoperasiId()
    if (!koperasiId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const cloudMember = await findMember(id, koperasiId)
    const member = cloudMember ? { memberId: cloudMember.anggota_ref, nama: cloudMember.nama, nik: cloudMember.nik, koperasi: { nama: cloudMember.nama_koperasi || `Koperasi ${cloudMember.koperasi_ref}`, kode: cloudMember.nik_koperasi || cloudMember.koperasi_ref } } : null
    if (!member) {
      return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
    }

    const cardDir = path.join(process.cwd(), 'public', 'card')
    const [logoBytes, ribbonBytes, backBytes] = await Promise.all([
      readFile(path.join(cardDir, 'logo-kopdes.png')),
      readFile(path.join(cardDir, 'ribbon.png')),
      readFile(path.join(cardDir, 'card-back.png')),
    ])

    const pdf = await PDFDocument.create()
    pdf.setTitle(`Kartu Anggota - ${member.nama}`)
    const [logo, ribbon, back] = await Promise.all([
      pdf.embedPng(logoBytes),
      pdf.embedPng(ribbonBytes),
      pdf.embedPng(backBytes),
    ])
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica)

    const page = pdf.addPage([A4_W, A4_H])

    // Dua kartu berdampingan, horizontal center, sepertiga atas halaman
    const totalW = CARD_W * 2 + CARD_GAP
    const frontX = (A4_W - totalW) / 2
    const backX = frontX + CARD_W + CARD_GAP
    const cardY = A4_H - 20 * MM - CARD_H

    // ---- Sisi depan ----
    page.drawRectangle({
      x: frontX,
      y: cardY,
      width: CARD_W,
      height: CARD_H,
      color: rgb(1, 1, 1),
      borderColor: BORDER,
      borderWidth: 0.5,
    })
    // Bar merah tepi atas
    page.drawRectangle({
      x: frontX,
      y: cardY + CARD_H - 0.5 * MM,
      width: CARD_W,
      height: 0.5 * MM,
      color: RED,
    })

    // Logo (lebar 21.6mm), horizontal center
    const logoW = 21.6 * MM
    const logoH = (logo.height / logo.width) * logoW
    let cursorY = cardY + CARD_H - 6 * MM - logoH
    page.drawImage(logo, {
      x: frontX + (CARD_W - logoW) / 2,
      y: cursorY,
      width: logoW,
      height: logoH,
    })
    cursorY -= 1 * MM

    // Nama koperasi (uppercase, merah, bold) — word-wrap manual, center
    const padX = 4.7 * MM
    const innerW = CARD_W - padX * 2
    const namaKopSize = 8.1
    const words = member.koperasi.nama.toUpperCase().split(/\s+/)
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w
      if (fontBold.widthOfTextAtSize(candidate, namaKopSize) > innerW && line) {
        lines.push(line)
        line = w
      } else {
        line = candidate
      }
    }
    if (line) lines.push(line)
    for (const l of lines) {
      cursorY -= namaKopSize * 1.25
      page.drawText(l, {
        x: frontX + (CARD_W - fontBold.widthOfTextAtSize(l, namaKopSize)) / 2,
        y: cursorY,
        size: namaKopSize,
        font: fontBold,
        color: RED,
      })
    }

    // Kode koperasi
    const kodeSize = 6
    cursorY -= kodeSize * 1.4 + 1 * MM
    page.drawText(member.koperasi.kode, {
      x: frontX + (CARD_W - fontRegular.widthOfTextAtSize(member.koperasi.kode, kodeSize)) / 2,
      y: cursorY,
      size: kodeSize,
      font: fontRegular,
      color: DARK,
    })

    // Garis pembatas merah 84%
    cursorY -= 2 * MM
    const dividerW = CARD_W * 0.84
    page.drawRectangle({
      x: frontX + (CARD_W - dividerW) / 2,
      y: cursorY,
      width: dividerW,
      height: 0.35 * MM,
      color: RED,
    })

    // Ribbon di tepi bawah (full width kartu)
    const ribbonH = (ribbon.height / ribbon.width) * CARD_W
    page.drawImage(ribbon, {
      x: frontX,
      y: cardY,
      width: CARD_W,
      height: ribbonH,
    })

    // Nama + NIK di kiri bawah, di atas ribbon
    const nikSize = 6.7
    const namaSize = 9.1
    let bottomY = cardY + ribbonH + 3 * MM
    page.drawText(formatNIK(member.nik), {
      x: frontX + padX,
      y: bottomY,
      size: nikSize,
      font: fontRegular,
      color: DARK,
    })
    bottomY += nikSize * 1.3 + 0.4 * MM
    page.drawText(member.nama, {
      x: frontX + padX,
      y: bottomY,
      size: namaSize,
      font: fontBold,
      color: DARK,
    })

    // ---- Sisi belakang: templat full-bleed ----
    page.drawImage(back, {
      x: backX,
      y: cardY,
      width: CARD_W,
      height: CARD_H,
    })
    page.drawRectangle({
      x: backX,
      y: cardY,
      width: CARD_W,
      height: CARD_H,
      borderColor: BORDER,
      borderWidth: 0.5,
    })

    // Garis potong (crop marks) di keempat sudut tiap kartu
    const mark = 3 * MM
    const gray = rgb(0.6, 0.6, 0.6)
    for (const cx of [frontX, backX]) {
      for (const [x, y, dx, dy] of [
        [cx, cardY + CARD_H, -1, 1],
        [cx + CARD_W, cardY + CARD_H, 1, 1],
        [cx, cardY, -1, -1],
        [cx + CARD_W, cardY, 1, -1],
      ] as const) {
        page.drawLine({
          start: { x, y },
          end: { x: x + dx * mark, y },
          thickness: 0.3,
          color: gray,
        })
        page.drawLine({
          start: { x, y },
          end: { x, y: y + dy * mark },
          thickness: 0.3,
          color: gray,
        })
      }
    }

    // Label keterangan
    const labelSize = 8
    page.drawText(`Kartu Anggota — ${member.nama} (${member.memberId})`, {
      x: frontX,
      y: cardY - 8 * MM,
      size: labelSize,
      font: fontRegular,
      color: gray,
    })
    page.drawText('Ukuran CR80: 54 × 85.6 mm — cetak pada skala 100%', {
      x: frontX,
      y: cardY - 8 * MM - labelSize * 1.5,
      size: labelSize,
      font: fontRegular,
      color: gray,
    })

    const bytes = await pdf.save()
    const filename = `kartu-anggota-${member.memberId}.pdf`
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Gagal membuat PDF kartu anggota:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
