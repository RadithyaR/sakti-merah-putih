import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, signToken } from '@/lib/auth';
import { cloudQuery } from '@/lib/cloud-db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const result = await cloudQuery<{
      pengurus_ref: string; koperasi_ref: string; username: string; password_hash: string;
      role: string; nama: string | null; nama_koperasi: string | null; nik_koperasi: string | null;
    }>(`select l.pengurus_ref, l.koperasi_ref, l.username, l.password_hash, l.role,
                 p.nama, pr.nama_koperasi, pr.nik_koperasi
            from app_pengurus_login l
            join pengurus_koperasi p on p.pengurus_ref=l.pengurus_ref and p.koperasi_ref=l.koperasi_ref
            left join profil_koperasi pr on pr.koperasi_ref=l.koperasi_ref
           where l.username=$1`, [username]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = signToken({
      pengurusRef: user.pengurus_ref,
      id: 0,
      username: user.username,
      role: user.role,
      koperasiRef: user.koperasi_ref,
      koperasiId: 0,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.pengurus_ref,
        username: user.username,
        nama: user.nama,
        role: user.role,
        koperasiRef: user.koperasi_ref,
        koperasi: { nama: user.nama_koperasi || `Koperasi ${user.koperasi_ref}`, nomorHukum: user.nik_koperasi },
      },
    });

    // Set cookie dari server
    response.cookies.set('token', token, {
      httpOnly: false, // Perlu false agar bisa dibaca di client juga
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 jam
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
