"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { ArrowRight, ArrowLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface StepConfig {
  id: string;
  question: string;
  subtext: string;
  type: "text" | "textarea" | "boolean";
  placeholder?: string;
}

const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "contact",
    question: "Halo! Sebelum kita mulai, siapa nama Anda dan nomor WhatsApp yang aktif?",
    subtext: "Kami memerlukan kontak Anda untuk mengirimkan blueprint serta menjadwalkan aliansi teknis berikutnya secara langsung.",
    type: "text",
    placeholder: "Nama Anda / No. WhatsApp (contoh: Pandu / 08123456xxx)"
  },
  {
    id: "businessProfile",
    question: "Bisa ceritakan secara singkat tentang profil bisnis Anda dan bagaimana alur pendapatannya saat ini?",
    subtext: "Bantu kami memahami model operasional bisnis Anda (apakah berupa penyewaan vila, retail, jasa ekspor, dll) agar arsitektur sistem kami selaras dengan skala bisnis Anda.",
    type: "textarea",
    placeholder: "Ceritakan bisnis Anda di sini..."
  },
  {
    id: "bottleneck",
    question: "Apa satu hambatan operasional terbesar yang paling menyita waktu, tenaga, atau biaya di bisnis Anda saat ini?",
    subtext: "Fokuskan pada masalah utama yang ingin segera diselesaikan (misalnya: admin kewalahan menjawab pesan WhatsApp masuk, inventaris sering selisih, atau pencatatan transaksi masih manual).",
    type: "textarea",
    placeholder: "Tulis hambatan utama bisnis Anda di sini..."
  },
  {
    id: "triedSolves",
    question: "Upaya apa saja yang sudah pernah Anda coba untuk menyelesaikan masalah tersebut, dan mengapa cara tersebut belum berhasil?",
    subtext: "Informasi ini membantu kami merancang solusi yang tepat sasaran tanpa mengulangi kesalahan atau kegagalan sistem yang pernah Anda alami sebelumnya.",
    type: "textarea",
    placeholder: "Misal: sudah pakai software X tapi ribet, sewa staf tambahan tapi tetap kewalahan..."
  },
  {
    id: "exactOutcome",
    question: "Hasil konkret apa yang paling penting dicapai oleh sistem baru ini, dan bagaimana kenyamanan Anda berkolaborasi dengan kami?",
    subtext: "Misal: ingin menghemat 15 jam kerja per minggu, otomatisasi reservasi penuh tanpa admin, atau ingin serah terima terima beres dengan bimbingan penuh.",
    type: "textarea",
    placeholder: "Gambarkan ekspektasi hasil nyata Anda di sini..."
  },
  {
    id: "references",
    question: "Apakah Anda memiliki referensi sistem, website kompetitor, atau alur kerja operasional tertentu yang ingin dijadikan acuan?",
    subtext: "Jika ada, cantumkan link website atau sebutkan nama sistem referensi Anda di sini (opsional).",
    type: "textarea",
    placeholder: "Link website kompetitor atau alur kerja yang Anda sukai..."
  }
];

function OnboardingFormInner() {
  const searchParams = useSearchParams();
  const clientNameParam = searchParams.get("name") || "";
  const clientWhatsappParam = searchParams.get("whatsapp") || searchParams.get("wa") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    contact: "",
    businessProfile: "",
    bottleneck: "",
    triedSolves: "",
    exactOutcome: "",
    references: "",
  });
  const [inputVal, setInputVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  
  const step = ONBOARDING_STEPS[currentStep];
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const submittingRef = useRef(false);

  // Pre-fill Step 0 contact info if provided in URL query parameters
  useEffect(() => {
    if (clientNameParam || clientWhatsappParam) {
      const contactVal = `${clientNameParam}${clientNameParam && clientWhatsappParam ? " / " : ""}${clientWhatsappParam}`;
      setFormData(prev => ({ ...prev, contact: contactVal }));
      if (currentStep === 0) {
        setInputVal(contactVal);
      }
    }
  }, [clientNameParam, clientWhatsappParam]);

  // Auto-focus input when step changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep, isDone]);

  // Sync state between step transition
  useEffect(() => {
    if (step.type === "boolean") {
      setInputVal("");
    } else {
      const savedVal = (formData[step.id as keyof typeof formData] as string) || "";
      setInputVal(savedVal);
    }
  }, [currentStep]);

  // Handle Toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "warning" = "warning") => {
    setToast({ message, type });
  };

  const handleNext = () => {
    if (isSubmitting || submittingRef.current) return;
    
    // Validate current step
    if (step.id !== "references" && !inputVal.trim()) {
      showToast("Kolom ini wajib diisi sebelum melanjutkan.");
      return;
    }

    // Save temporary data
    const updatedData = { ...formData, [step.id]: inputVal };
    setFormData(updatedData);

    // Advance or submit
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitForm(updatedData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitForm = async (finalData = formData) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      // Split contact info into Name and Whatsapp
      let name = "";
      let whatsapp = "";

      const rawContact = finalData.contact.trim();
      const splitIndex = rawContact.indexOf("/");
      if (splitIndex !== -1) {
        name = rawContact.substring(0, splitIndex).trim();
        whatsapp = rawContact.substring(splitIndex + 1).trim();
      } else {
        // Fallback split by space if no slash exists
        const parts = rawContact.split(" ");
        if (parts.length > 1) {
          name = parts[0];
          whatsapp = parts.slice(1).join(" ");
        } else {
          name = rawContact;
          whatsapp = rawContact;
        }
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          whatsapp: whatsapp || undefined,
          businessProfile: finalData.businessProfile,
          bottleneck: finalData.bottleneck,
          triedSolves: finalData.triedSolves,
          exactOutcome: finalData.exactOutcome,
          references: finalData.references,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsDone(true);
        showToast("Data onboarding berhasil dikirim!", "success");
      } else {
        submittingRef.current = false;
        setIsSubmitting(false);
        showToast(data.error || "Terjadi kesalahan saat mengirim formulir.", "error");
      }
    } catch (e) {
      console.error(e);
      submittingRef.current = false;
      setIsSubmitting(false);
      showToast("Koneksi gagal. Silakan periksa jaringan internet Anda.", "error");
    }
  };

  // Keyboard Navigation listener for inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // If it's a textarea, require Ctrl+Enter to advance
      if (step.type === "textarea" && !e.ctrlKey) {
        return;
      }
      e.preventDefault();
      handleNext();
    } else if (e.key === "Backspace") {
      // Go back if input is empty
      if (inputVal === "") {
        e.preventDefault();
        handlePrev();
      }
    }
  };

  // Global event listener for button-only steps (e.g. boolean/budget step)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || isDone) return;

      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      
      // If user is inside an input, let handleKeyDown do the work
      if (isInput) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentStep, isSubmitting, isDone]);

  const progressPct = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  if (isDone) {
    return (
      <div className="relative min-h-screen bg-black flex flex-col justify-between p-6 md:p-12 text-white overflow-hidden">
        {/* Header */}
        <header className="z-10 flex justify-between items-center">
          <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
        </header>

        {/* Success Content */}
        <main className="z-10 max-w-xl mx-auto flex-1 flex flex-col justify-center items-center text-center animate-fade-in my-12">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light leading-snug mb-4">
            Terima Kasih, <br />
            <span className="italic text-gray-400">Data Anda Telah Kami Amankan</span>
          </h1>
          <p className="font-sans text-sm md:text-base text-gray-400 mb-2 leading-relaxed max-w-md">
            Langkah kualifikasi awal selesai. Kami sedang menganalisis data operasional bisnis Anda untuk memetakan arsitektur sistem yang tepat. Kami akan segera menghubungi Anda kembali melalui nomor WhatsApp yang terdaftar.
          </p>
        </main>

        {/* Footer */}
        <footer className="z-10 text-center text-xs text-gray-600 font-sans">
          &copy; {new Date().getFullYear()} Cleaire. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col justify-between p-6 md:p-12 text-white overflow-hidden">
      {/* Toast Bubble */}
      {toast && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-md border animate-fade-in ${
            toast.type === "success" 
              ? "bg-white/10 border-white text-white" 
              : toast.type === "error" 
                ? "bg-red-500/10 border-red-500 text-red-400" 
                : "bg-gray-800 border-gray-700 text-gray-300"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
          <span className="text-xs md:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-neutral-900">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out" 
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header */}
      <header className="z-10 flex justify-between items-center mt-2">
        <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
        <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-sans">
          Langkah {currentStep + 1} dari {ONBOARDING_STEPS.length}
        </div>
      </header>

      {/* Form Content */}
      <main className="z-10 max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center py-12 transition-all duration-500 animate-fade-in">
        <div className="space-y-6">
          {/* Question Display */}
          <div>
            <h1 className="font-serif text-2xl md:text-4xl font-light leading-snug text-white tracking-wide animate-fade-in" key={currentStep}>
              {step.question}
            </h1>
            <p className="font-sans text-xs md:text-sm text-gray-400 mt-3 leading-relaxed max-w-xl">
              {step.subtext}
            </p>
          </div>

          {/* Form Input fields */}
          <div className="pt-4">
            {step.type === "text" && (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={step.placeholder}
                className="w-full bg-transparent border-b border-neutral-800 focus:border-white outline-none py-3 text-lg md:text-xl font-sans transition-all text-white placeholder-neutral-700"
              />
            )}

            {step.type === "textarea" && (
              <div className="space-y-2">
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={step.placeholder}
                  rows={4}
                  className="w-full bg-transparent border-b border-neutral-800 focus:border-white outline-none py-2 text-base md:text-lg font-sans transition-all resize-none text-white placeholder-neutral-700"
                />
                <span className="block text-[10px] text-gray-500 font-sans">
                  *Tekan Lanjut di bawah atau gunakan <kbd className="bg-neutral-900 px-1.5 py-0.5 rounded text-[10px] text-gray-400">Ctrl + Enter</kbd>
                </span>
              </div>
            )}

          </div>

          {/* Nav Controls inside main area */}
          <div className="pt-6 flex items-center gap-4">
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg text-xs md:text-sm font-semibold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="z-10 flex justify-between items-center border-t border-neutral-900 pt-6">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
          className="text-xs md:text-sm font-semibold text-gray-500 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="text-[10px] md:text-xs text-gray-600 font-sans tracking-wide">
          Gunakan tombol di atas atau klik pilihan untuk menavigasi.
        </div>
      </footer>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans text-sm">
        <Loader2 className="w-6 h-6 animate-spin text-white mr-2" />
        Memuat...
      </div>
    }>
      <OnboardingFormInner />
    </Suspense>
  );
}
