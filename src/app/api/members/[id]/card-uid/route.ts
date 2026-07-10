import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; koperasiId: number };
    const koperasiId = decoded.koperasiId;

    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const cardUid = typeof body.cardUid === 'string' ? body.cardUid.trim() : '';

    if (!cardUid) {
      return NextResponse.json(
        { error: 'UID kartu Kopdes tidak boleh kosong' },
        { status: 400 }
      );
    }

    const existing = await prisma.member.findFirst({
      where: { id: memberId, koperasiId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    try {
      const member = await prisma.member.update({
        where: { id: memberId },
        data: { kopdesCardUid: cardUid },
        include: { ktpRecord: true },
      });

      return NextResponse.json({ member });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'UID kartu Kopdes ini sudah terpasang ke anggota lain' },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
