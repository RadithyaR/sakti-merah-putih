import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const totalCount = await prisma.ktpRecord.count();

    if (totalCount === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data KTP dalam database' },
        { status: 404 }
      );
    }

    const randomSkip = Math.floor(Math.random() * totalCount);

    const ktpRecord = await prisma.ktpRecord.findMany({
      skip: randomSkip,
      take: 1,
    });

    return NextResponse.json({ ktp: ktpRecord[0] });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
