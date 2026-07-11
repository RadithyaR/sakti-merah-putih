"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, CheckCircle, AlertCircle, CreditCard, FileDown } from "lucide-react";
import RfidScanner from "@/components/RfidScanner";
import KtpCard from "@/components/KtpCard";
import WebcamCapture from "@/components/WebcamCapture";
import KopdesCardScanner from "@/components/KopdesCardScanner";

interface KtpData {
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
  rfidUid: string;
}

export default function PendaftaranPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ktpData, setKtpData] = useState<KtpData | null>(null);
  const [foto, setFoto] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [newMemberDbId, setNewMemberDbId] = useState<string | null>(null);
  const [kopdesCardUid, setKopdesCardUid] = useState("");
  const [cardError, setCardError] = useState("");

  const handleKtpFound = (ktp: KtpData) => {
    setKtpData(ktp);
    setError("");
    setStep(2);
  };

  const handleKtpError = (errorMessage: string) => {
    setError(errorMessage);
    setKtpData(null);
  };

  const handleCapture = (imageData: string) => {
    setFoto(imageData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ktpData) {
      setError("Data KTP belum tersedia");
      return;
    }

    if (!foto) {
      setError("Foto belum diambil");
      return;
    }

    if (!phone) {
      setError("Nomor telepon harus diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nik: ktpData.nik,
          nama: ktpData.nama,
          phone,
          email: email || undefined,
          foto,
          jenisKelamin: ktpData.jenisKelamin,
          pekerjaan: ktpData.pekerjaan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pendaftaran gagal");
      }

      setMemberId(data.member.memberId);
      setNewMemberDbId(data.member.id);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleCardSaved = async (cardUid: string) => {
    if (!newMemberDbId) return;

    setCardError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/members/${newMemberDbId}/card-uid`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardUid }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan UID kartu Kopdes");
      }

      setKopdesCardUid(cardUid);
      setSuccess(true);
      setStep(4);
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  const handleCardSkip = () => {
    setCardError("");
    setSuccess(true);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setKtpData(null);
    setFoto("");
    setPhone("");
    setEmail("");
    setError("");
    setSuccess(false);
    setMemberId("");
      setNewMemberDbId(null);
    setKopdesCardUid("");
    setCardError("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Pendaftaran Anggota Baru
        </h1>
        <p className="text-text-secondary mt-1">
          {step === 1 && "Langkah 1: Scan kartu RFID untuk membaca data KTP"}
          {step === 2 && "Langkah 2: Verifikasi data dan ambil foto"}
          {step === 3 && "Langkah 3: Tautkan UID kartu Kopdes"}
          {step === 4 && "Pendaftaran berhasil!"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-2">
          {[
            { n: 1, label: "Scan RFID" },
            { n: 2, label: "Data & Foto" },
            { n: 3, label: "Kartu Kopdes" },
            { n: 4, label: "Selesai" },
          ].map((s, idx) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex items-center gap-2 ${step >= s.n ? "text-primary" : "text-text-secondary"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    step >= s.n ? "bg-primary text-white" : "bg-surface"
                  }`}
                >
                  {s.n}
                </div>
                <span className="font-medium whitespace-nowrap">{s.label}</span>
              </div>
              {idx < 3 && (
                <div className="flex-1 h-1 mx-4 bg-surface">
                  <div
                    className={`h-full transition-all ${step >= s.n + 1 ? "bg-primary w-full" : "w-0"}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: RFID Scanner */}
      {step === 1 && (
        <RfidScanner onKtpFound={handleKtpFound} onError={handleKtpError} />
      )}

      {/* Step 2: KTP Data + Webcam + Form */}
      {step === 2 && ktpData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* KTP Card */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Data KTP
              </h3>
              <KtpCard ktp={ktpData} />
            </div>

            {/* Webcam + Form */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  Foto Anggota
                </h3>
                <WebcamCapture onCapture={handleCapture} />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  Informasi Tambahan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      Email{" "}
                      <span className="text-text-secondary">(opsional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border-2 border-border text-text-primary rounded-lg hover:bg-surface transition-colors font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !foto}
              className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Daftarkan Anggota
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Kartu Kopdes */}
      {step === 3 && newMemberDbId && (
        <div className="space-y-4">
          {cardError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{cardError}</p>
              </div>
            </div>
          )}
          <KopdesCardScanner onSaved={handleCardSaved} onSkip={handleCardSkip} />
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && success && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-border text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Pendaftaran Berhasil!
          </h2>
          <p className="text-text-secondary mb-6">
            Anggota baru telah berhasil didaftarkan ke dalam sistem koperasi.
          </p>
          <div className="bg-surface rounded-lg p-6 mb-8 inline-block">
            <p className="text-sm text-text-secondary mb-1">Nomor Anggota</p>
            <p className="text-3xl font-bold font-mono text-primary">
              {memberId}
            </p>
            {kopdesCardUid && (
              <>
                <p className="text-sm text-text-secondary mb-1 mt-4">
                  UID Kartu Kopdes
                </p>
                <p className="text-lg font-semibold font-mono text-text-primary">
                  {kopdesCardUid}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {newMemberDbId && (
              <>
                <button
                  onClick={() => router.push(`/anggota/${newMemberDbId}/kartu`)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  <CreditCard className="w-5 h-5" />
                  Cetak Kartu Anggota
                </button>
                <a
                  href={`/api/members/${newMemberDbId}/card`}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
                >
                  <FileDown className="w-5 h-5" />
                  Download PDF Kartu
                </a>
              </>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
            >
              Daftarkan Anggota Lain
            </button>
            <button
              onClick={() => router.push("/anggota")}
              className="px-6 py-3 border-2 border-border text-text-primary rounded-lg hover:bg-surface transition-colors font-semibold"
            >
              Lihat Daftar Anggota
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
