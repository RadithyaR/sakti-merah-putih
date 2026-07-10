import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify token dan extract koperasiId
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; koperasiId: number };
    const koperasiId = decoded.koperasiId;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      koperasiId: koperasiId, // Filter by koperasi
    };

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: { ktpRecord: true },
        skip,
        take: limit,
        orderBy: { tanggalDaftar: 'desc' },
      }),
      prisma.member.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      members,
      total,
      page,
      totalPages,
    });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify token dan extract koperasiId
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; koperasiId: number };
    const koperasiId = decoded.koperasiId;

    const { nik, nama, phone, email, foto, rfidUid } = await request.json();

    if (!nik || !nama || !phone || !foto || !rfidUid) {
      return NextResponse.json(
        { error: 'Field nik, nama, phone, foto, dan rfidUid wajib diisi' },
        { status: 400 }
      );
    }

    const existingMember = await prisma.member.findUnique({
      where: { nik },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'NIK sudah terdaftar sebagai anggota di koperasi lain' },
        { status: 409 }
      );
    }

    // Generate memberId: KPR-YYYYMMDD-XXX
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    let memberId = '';
    let isUnique = false;

    while (!isUnique) {
      const randomDigits = Math.floor(Math.random() * 900 + 100).toString();
      const candidateId = `KPR-${dateStr}-${randomDigits}`;

      const existing = await prisma.member.findUnique({
        where: { memberId: candidateId },
      });

      if (!existing) {
        memberId = candidateId;
        isUnique = true;
      }
    }

    const member = await prisma.member.create({
      data: {
        memberId,
        nik,
        nama,
        phone,
        email,
        foto,
        koperasiId,
      },
      include: { ktpRecord: true },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
