"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  ExternalLink, 
  Lock, 
  RefreshCw, 
  ChevronLeft,
  Eye,
  X,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

interface OnboardingItem {
  id: string;
  name: string | null;
  whatsapp: string | null;
  businessProfile: string;
  bottleneck: string;
  triedSolves: string;
  exactOutcome: string;
  references: string;
  createdAt: string;
}

export default function AdminOnboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [submissions, setSubmissions] = useState<OnboardingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OnboardingItem | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
    show: false,
    message: "",
    type: "success"
  });

  useEffect(() => {
    const isAuth = sessionStorage.getItem("clear_admin_authenticated");
    if (isAuth === "true") {
      setIsAuthenticated(true);
      fetchSubmissions();
    }
  }, []);

  const triggerToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("clear_admin_authenticated", "true");
      setIsAuthenticated(true);
      setLoginError("");
      fetchSubmissions();
      triggerToast("Login berhasil!", "success");
    } else {
      setLoginError("Username atau password salah.");
      triggerToast("Login gagal", "error");
    }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/onboarding");
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.submissions || []);
      } else {
        triggerToast("Gagal mengambil data submissions.", "error");
      }
    } catch (err) {
      triggerToast("Terjadi kendala koneksi ke server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus data onboarding ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/onboarding?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Data onboarding berhasil dihapus.", "success");
        setSubmissions(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        triggerToast(data.error || "Gagal menghapus data.", "error");
      }
    } catch (err) {
      triggerToast("Terjadi kesalahan koneksi.", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center px-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#2D5A27] rounded-full blur-[100px] opacity-5 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#8C6239] rounded-full blur-[100px] opacity-5 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,45,36,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,45,36,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

        <div className="max-w-[420px] w-full bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#1C2D24]/5 shadow-sm relative z-10">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain mb-3" />
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#5B7A68] uppercase font-mono">ONBOARDING ADMIN PORTAL</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#5B7A68] mb-2 font-mono">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#F9F6F0]/50 border border-[#1C2D24]/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D5A27] focus:bg-white text-[#1C2D24]"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#5B7A68] mb-2 font-mono">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#F9F6F0]/50 border border-[#1C2D24]/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D5A27] focus:bg-white text-[#1C2D24]"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-700 bg-rose-50 px-3 py-2 rounded border border-rose-200/50">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#1C2D24] text-[#F9F6F0] rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-[#2D5A27] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Masuk Dasbor
            </button>
          </form>
        </div>
      </div>
    );
  }

  const whatsappLeadsCount = submissions.filter(s => s.whatsapp).length;

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1C2D24] font-sans antialiased relative pb-16">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(28,45,36,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,45,36,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0"></div>

      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#1C2D24]/5 py-4 z-40 relative">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-[#5B7A68] hover:text-[#1C2D24] flex items-center gap-1 font-mono uppercase font-bold">
              <ChevronLeft className="w-4 h-4" />
              Formulir
            </Link>
            <div className="h-4 w-[1px] bg-neutral-200" />
            <div className="flex items-baseline gap-2">
              <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
              <span className="font-mono text-[8px] font-bold tracking-widest text-[#8C6239] uppercase bg-[#8C6239]/10 px-2 py-0.5 rounded">
                LEADS ONBOARDING
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              sessionStorage.removeItem("clear_admin_authenticated");
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1C2D24]/10 rounded-full text-[9px] font-bold tracking-wider uppercase text-[#5B7A68] hover:text-[#1C2D24] hover:border-[#1C2D24] transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1C2D24]">
              Data Kualifikasi Onboarding <br />
              <span className="font-serif italic text-[#5B7A68]">5 Pertanyaan Klien</span>
            </h1>
          </div>
          
          <button 
            onClick={fetchSubmissions}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-3 rounded-lg bg-[#1C2D24] text-[#F9F6F0] hover:bg-[#2D5A27] transition-all text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Perbarui Data
          </button>
        </div>

        {/* Widgets Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase block mb-1">TOTAL LEADS MASUK</span>
              <span className="text-2xl font-semibold text-[#1C2D24]">{submissions.length}</span>
            </div>
            <FileText className="w-8 h-8 text-[#5B7A68]/30" />
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#2D5A27] uppercase block mb-1">SIAP HUBUNGI (ADA WA)</span>
              <span className="text-2xl font-semibold text-[#2D5A27]">{whatsappLeadsCount}</span>
            </div>
            <CheckCircle className="w-8 h-8 text-[#2D5A27]/30" />
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#8C6239] uppercase block mb-1">LEADS ANONIM</span>
              <span className="text-2xl font-semibold text-[#8C6239]">{submissions.length - whatsappLeadsCount}</span>
            </div>
            <HelpCircle className="w-8 h-8 text-[#8C6239]/30" />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-2xl border border-[#1C2D24]/5 overflow-hidden shadow-sm">
          {isLoading && submissions.length === 0 ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-[#5B7A68] animate-spin mx-auto mb-3" />
              <p className="font-serif italic text-sm text-[#5B7A68]/80">Mengambil data onboarding...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-24 text-center">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="font-serif italic text-sm text-neutral-400">Belum ada respon onboarding yang terekam.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1C2D24]/5 bg-[#F9F6F0]/20 text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase">
                    <th className="px-6 py-4">KLIEN</th>
                    <th className="px-6 py-4">MASALAH UTAMA (BOTTLENECK)</th>
                    <th className="px-6 py-4">TANGGAL MASUK</th>
                    <th className="px-6 py-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2D24]/5 text-sm">
                  {submissions.map((item) => {
                    const waLink = item.whatsapp ? `https://wa.me/${item.whatsapp.replace(/\D/g, "")}` : null;
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-[#F9F6F0]/20 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-[#1C2D24]">{item.name || "Anonim"}</div>
                          {item.whatsapp && (
                            <a 
                              href={waLink || "#"} 
                              target="_blank" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-mono text-[#5B7A68] hover:text-[#2D5A27] inline-flex items-center gap-1 mt-1"
                            >
                              {item.whatsapp}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-5 max-w-xs truncate text-neutral-600">
                          {item.bottleneck}
                        </td>
                        <td className="px-6 py-5 text-xs text-neutral-500 font-mono">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 text-right">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-1.5 rounded bg-white text-neutral-600 hover:text-black border border-neutral-200 transition-colors cursor-pointer"
                              title="Lihat Semua Jawaban"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => deleteSubmission(item.id, e)}
                              className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/40 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-[#F9F6F0] rounded-2xl shadow-2xl p-6 border border-[#1C2D24]/10 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#1C2D24]/10 pb-4 mb-6">
              <span className="text-[9px] font-mono text-[#8C6239] font-bold tracking-widest uppercase">DETAIL DATA ONBOARDING</span>
              <h3 className="font-serif text-2xl font-light text-[#1C2D24] mt-1">{selectedItem.name || "Klien Anonim"}</h3>
              <div className="flex gap-4 items-center mt-2">
                {selectedItem.whatsapp && (
                  <a 
                    href={`https://wa.me/${selectedItem.whatsapp.replace(/\D/g, "")}`} 
                    target="_blank" 
                    className="text-xs font-mono text-[#5B7A68] hover:text-[#2D5A27] inline-flex items-center gap-1.5"
                  >
                    <span>Hubungi WA ({selectedItem.whatsapp})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span className="text-[10px] text-gray-400 font-mono">Diterima: {formatDate(selectedItem.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Question 1 */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#5B7A68] uppercase">1. Profil Bisnis & Alur Pendapatan</h4>
                <p className="bg-white p-4 rounded-xl border border-neutral-100 text-sm leading-relaxed text-[#1C2D24] whitespace-pre-line">
                  {selectedItem.businessProfile}
                </p>
              </div>

              {/* Question 2 */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#5B7A68] uppercase">2. Hambatan Terbesar (Bottleneck)</h4>
                <p className="bg-white p-4 rounded-xl border border-neutral-100 text-sm leading-relaxed text-[#1C2D24] whitespace-pre-line">
                  {selectedItem.bottleneck}
                </p>
              </div>

              {/* Question 3 */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#5B7A68] uppercase">3. Solusi yang Pernah Dicoba & Alasan Gagal</h4>
                <p className="bg-white p-4 rounded-xl border border-neutral-100 text-sm leading-relaxed text-[#1C2D24] whitespace-pre-line">
                  {selectedItem.triedSolves}
                </p>
              </div>

              {/* Question 4 */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#5B7A68] uppercase">4. Outcome & Ekspektasi Hasil Nyata</h4>
                <p className="bg-white p-4 rounded-xl border border-neutral-100 text-sm leading-relaxed text-[#1C2D24] whitespace-pre-line">
                  {selectedItem.exactOutcome}
                </p>
              </div>

              {/* Question 5 */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#5B7A68] uppercase">5. Referensi Sistem / Website Kompetitor</h4>
                <p className="bg-white p-4 rounded-xl border border-neutral-100 text-sm leading-relaxed text-[#1C2D24] whitespace-pre-line italic">
                  {selectedItem.references || "(Tidak diisi)"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-[#1C2D24]/10 pt-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-[#1C2D24] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white shadow-lg border text-xs font-medium max-w-sm transition-all duration-300 transform translate-y-0 ${
          toast.type === "success" 
            ? "border-emerald-500/30 text-[#1C2D24]" 
            : toast.type === "warning"
            ? "border-amber-500/30 text-amber-900"
            : "border-rose-500/30 text-rose-900"
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            toast.type === "success" ? "bg-emerald-500" : toast.type === "warning" ? "bg-amber-500" : "bg-rose-500"
          }`}></span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
