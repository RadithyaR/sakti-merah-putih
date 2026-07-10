import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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
const VALID_GENDER = ['L', 'P'];

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

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

    // Data anggota (tabel Member)
    const nama = str(body.nama);
    const phone = str(body.phone);
    const email = str(body.email);
    const status = str(body.status);
    const foto = typeof body.foto === 'string' ? body.foto : undefined;
    const tanggalDaftarRaw = str(body.tanggalDaftar);
    const kopdesCardUid = str(body.kopdesCardUid);

    if (!nama || !phone || !status) {
      return NextResponse.json(
        { error: 'Field nama, phone, dan status wajib diisi' },
        { status: 400 }
      );
    }

    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    let tanggalDaftar: Date | undefined;
    if (tanggalDaftarRaw) {
      tanggalDaftar = new Date(tanggalDaftarRaw);
      if (isNaN(tanggalDaftar.getTime())) {
        return NextResponse.json(
          { error: 'Tanggal terdaftar tidak valid' },
          { status: 400 }
        );
      }
    }

    // Data kependudukan (tabel KtpRecord, terhubung via NIK) — NIK dan rfidUid
    // tidak pernah diterima dari body ini, jadi tidak bisa diubah dari form edit.
    const tempatLahir = str(body.tempatLahir);
    const tanggalLahirRaw = str(body.tanggalLahir);
    const jenisKelamin = str(body.jenisKelamin);
    const alamat = str(body.alamat);
    const rtRw = str(body.rtRw);
    const kelurahan = str(body.kelurahan);
    const kecamatan = str(body.kecamatan);
    const kabupaten = str(body.kabupaten);
    const provinsi = str(body.provinsi);
    const agama = str(body.agama);
    const statusPerkawinan = str(body.statusPerkawinan);
    const pekerjaan = str(body.pekerjaan);

    if (jenisKelamin && !VALID_GENDER.includes(jenisKelamin)) {
      return NextResponse.json(
        { error: 'Jenis kelamin tidak valid' },
        { status: 400 }
      );
    }

    let tanggalLahir: Date | undefined;
    if (tanggalLahirRaw) {
      tanggalLahir = new Date(tanggalLahirRaw);
      if (isNaN(tanggalLahir.getTime())) {
        return NextResponse.json(
          { error: 'Tanggal lahir tidak valid' },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.member.findFirst({
      where: { id: memberId, koperasiId },
      include: { ktpRecord: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    const member = await prisma.$transaction(async (tx) => {
      await tx.ktpRecord.update({
        where: { nik: existing.nik },
        data: {
          ...(tempatLahir && { tempatLahir }),
          ...(tanggalLahir && { tanggalLahir }),
          ...(jenisKelamin && { jenisKelamin }),
          ...(alamat && { alamat }),
          ...(rtRw && { rtRw }),
          ...(kelurahan && { kelurahan }),
          ...(kecamatan && { kecamatan }),
          ...(kabupaten && { kabupaten }),
          ...(provinsi && { provinsi }),
          ...(agama && { agama }),
          ...(statusPerkawinan && { statusPerkawinan }),
          ...(pekerjaan && { pekerjaan }),
        },
      });

      return tx.member.update({
        where: { id: memberId },
        data: {
          nama,
          phone,
          email: email || null,
          status,
          ...(foto && { foto }),
          ...(tanggalDaftar && { tanggalDaftar }),
          ...(kopdesCardUid && { kopdesCardUid }),
        },
        include: { ktpRecord: true },
      });
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
