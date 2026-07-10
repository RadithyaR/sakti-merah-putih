import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { koperasi: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      koperasiId: user.koperasiId,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
        koperasiId: user.koperasiId,
        koperasi: user.koperasi,
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
