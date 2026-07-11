import Link from "next/link";
import Image from "next/image";
import { Wifi, Camera, CreditCard, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-surface to-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-80 h-20 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="SAKTI Logo"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
          </div>
          <Link
            href="/login"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
            Sistem Anggota Koperasi
            <span className="text-primary block">Terintegrasi Identitas</span>
          </h2>
          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            Pendaftaran anggota koperasi menjadi lebih mudah dan cepat dengan
            teknologi biometrik, Data KTP otomatis, foto digital, dan manajemen
            anggota terintegrasi.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-lg"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/test-kartu"
              className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold text-lg"
            >
              Test Kartu
            </Link>
            <a
              href="#fitur"
              className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold text-lg"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="container mx-auto px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-text-primary mb-4">
            Fitur Unggulan
          </h3>
          <p className="text-center text-text-secondary mb-16">
            Teknologi modern untuk memudahkan pengelolaan koperasi Anda
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border-2 border-border hover:border-primary transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Wifi className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-3">
                RFID Scanner
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Tap kartu RFID untuk membaca data KTP warga secara otomatis dari
                database kependudukan. Cepat, akurat, dan tanpa input manual.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border-2 border-border hover:border-primary transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-3">
                Foto Digital
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Ambil foto anggota langsung dari webcam terintegrasi. Foto
                otomatis tersimpan dan terhubung dengan data anggota.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border-2 border-border hover:border-primary transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-3">
                Manajemen Anggota
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Kelola data anggota dengan mudah. Lihat daftar, detail, dan
                statistik anggota dalam satu dashboard terintegrasi.
              </p>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-secondary"><CreditCard className="w-4 h-4 text-primary" />Test kartu publik hanya menampilkan data keanggotaan yang aman.</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="border-t border-white/20 pt-8 text-center">
              <p className="text-white/70">
                &copy; 2026 Koperasi Desa Merah Putih. Dibuat untuk Hackathon
                Koperasi Desa.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
