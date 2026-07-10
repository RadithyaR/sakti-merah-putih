import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify token dan extract koperasiId
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; koperasiId: number };
    const koperasiId = decoded.koperasiId;

    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, koperasiId },
      include: { ktpRecord: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

const VALID_STATUS = ['Aktif', 'Tidak Aktif'];

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
    const nama = typeof body.nama === 'string' ? body.nama.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const status = typeof body.status === 'string' ? body.status : '';

    if (!nama || !phone || !status) {
      return NextResponse.json(
        { error: 'Field nama, phone, dan status wajib diisi' },
        { status: 400 }
      );
    }

    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
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

    const member = await prisma.member.update({
      where: { id: memberId },
      data: { nama, phone, email: email || null, status },
      include: { ktpRecord: true },
    });

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existing = await prisma.member.findFirst({
      where: { id: memberId, koperasiId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.member.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
