import { NextResponse } from 'next/server';
import { randomKtpMock } from '@/lib/cloud-db';

export async function POST() {
  try {
    const ktpRecord = await randomKtpMock();

    if (!ktpRecord) {
      return NextResponse.json(
        { error: 'Tidak ada data KTP dalam database' },
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
