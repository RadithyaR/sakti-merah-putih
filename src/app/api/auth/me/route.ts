import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    const payload = verifyToken(token) as { id: number; username: string; role: string; koperasiId: number };

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        koperasiId: true,
        koperasi: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            kode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: 'Token tidak valid atau sudah kedaluwarsa' },
      { status: 401 }
    );
  }
}
