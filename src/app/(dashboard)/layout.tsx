import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-surface">{children}</main>
      </div>
    </div>
  )
}
