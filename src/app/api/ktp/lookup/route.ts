import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { rfidUid } = await request.json();

    if (!rfidUid) {
      return NextResponse.json(
        { error: 'RFID UID wajib diisi' },
        { status: 400 }
      );
    }

    const ktpRecord = await prisma.ktpRecord.findUnique({
      where: { rfidUid },
      include: {
        member: true,
      },
    });

    if (!ktpRecord) {
      return NextResponse.json(
        { error: 'Data KTP tidak ditemukan untuk RFID UID ini' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ktp: ktpRecord });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
