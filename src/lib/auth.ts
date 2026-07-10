import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export type JwtPayload = {
  id: number
  username: string
  role: string
  koperasiId: number
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getKoperasiId(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return null
  
  try {
    const payload = verifyToken(token)
    return payload.koperasiId
  } catch {
    return null
  }
}
