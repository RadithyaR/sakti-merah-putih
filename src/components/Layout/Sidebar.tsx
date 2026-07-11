"use client";

import { useRouter } from "next/navigation";
import { Shield, Users, UserPlus, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/pendaftaran", label: "Pendaftaran Anggota", icon: UserPlus },
    { href: "/anggota", label: "Daftar Anggota", icon: Users },
    { href: "/verifikasi-kartu", label: "Test Kartu Anggota", icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center justify-center">
          <div className="w-160 h-20 rounded-lg overflow-hidden flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="SAKTI Logo"
              width={160}
              height={80}
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-primary hover:bg-surface"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-primary hover:bg-surface transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
