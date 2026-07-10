export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function generateMemberId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `KPR-${year}${month}${day}-${random}`
}

export function formatNIK(nik: string): string {
  return nik.replace(/(.{4})/g, '$1.').replace(/\.$/, '')
}

export function getAge(birthDate: Date | string): number {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const monthDiff = today.getMonth() - d.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--
  }
  return age
}
