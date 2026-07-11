import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cloudQuery } from '@/lib/cloud-db';

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

    const payload = verifyToken(token);

    if (!payload?.pengurusRef) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const result = await cloudQuery<{pengurus_ref:string; username:string; role:string; nama:string|null; koperasi_ref:string; nama_koperasi:string|null; nik_koperasi:string|null}>(`select l.pengurus_ref,l.username,l.role,p.nama,l.koperasi_ref,pr.nama_koperasi,pr.nik_koperasi from app_pengurus_login l join pengurus_koperasi p on p.pengurus_ref=l.pengurus_ref and p.koperasi_ref=l.koperasi_ref left join profil_koperasi pr on pr.koperasi_ref=l.koperasi_ref where l.pengurus_ref=$1`, [payload.pengurusRef]);
    const row = result.rows[0];

    if (!row) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: { id: row.pengurus_ref, username: row.username, nama: row.nama || 'Pengurus', role: row.role, koperasiRef: row.koperasi_ref, koperasi: { nama: row.nama_koperasi || `Koperasi ${row.koperasi_ref}`, nomorHukum: row.nik_koperasi } } });
  } catch {
    return NextResponse.json(
      { error: 'Token tidak valid atau sudah kedaluwarsa' },
      { status: 401 }
    );
  }
}
