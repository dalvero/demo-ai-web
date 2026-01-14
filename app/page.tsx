"use client";

import { useState } from "react";
import Image from "next/image";
import { predictWithHF, PredictionResult, ApiResponse } from "@/lib/hfApi";

type JawType = "upper" | "lower";

export default function Home() {
  const [upperFile, setUpperFile] = useState<File | null>(null);
  const [lowerFile, setLowerFile] = useState<File | null>(null);
  const [upperImage, setUpperImage] = useState<string | null>(null);
  const [lowerImage, setLowerImage] = useState<string | null>(null);
  const [upperResult, setUpperResult] = useState<PredictionResult | null>(null);
  const [lowerResult, setLowerResult] = useState<PredictionResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUpload(file: File, jawType: JawType) {
    const imageUrl = URL.createObjectURL(file);
    if (jawType === "upper") {
      setUpperFile(file);
      setUpperImage(imageUrl);
    } else {
      setLowerFile(file);
      setLowerImage(imageUrl);
    }
  }

  async function handlePredict() {
    if (!upperFile || !lowerFile) {
      setError("Harap unggah kedua foto rahang (atas & bawah)");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result: ApiResponse = await predictWithHF(upperFile, lowerFile);

      if (result.upper_jaw && result.lower_jaw) {
        setUpperResult(result.upper_jaw);
        setLowerResult(result.lower_jaw);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melakukan prediksi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-tr from-emerald-50 via-white to-teal-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER SECTION */}
        <header className="text-center mb-12">
          <div className="inline-block p-2 bg-emerald-100 rounded-2xl mb-4">
            <span className="text-emerald-700 text-sm font-bold uppercase tracking-wider px-3">
              AI Health Technology
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Dental <span className="text-emerald-600">Caries</span> Detection
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Sistem cerdas deteksi karies gigi menggunakan AI. Unggah foto rontgen atau foto rahang Anda untuk memulai analisis.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg mb-8 flex items-center shadow-sm">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        {/* UPLOAD GRID */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <UploadCard
            title="Rahang Atas"
            description="Unggah foto perspektif rahang atas"
            imageUrl={upperImage}
            onFileChange={(file) => handleUpload(file, "upper")}
          />
          <UploadCard
            title="Rahang Bawah"
            description="Unggah foto perspektif rahang bawah"
            imageUrl={lowerImage}
            onFileChange={(file) => handleUpload(file, "lower")}
          />
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handlePredict}
            disabled={loading || !upperFile || !lowerFile}
            className={`
              relative px-10 py-4 rounded-full font-bold text-white transition-all duration-300 shadow-lg shadow-emerald-200
              ${loading 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95"}
            `}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menganalisis...
              </span>
            ) : (
              "Mulai Deteksi Sekarang"
            )}
          </button>
        </div>

        {/* RESULT GRID */}
        {(upperResult || lowerResult) && (
          <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {upperResult && <ResultCard title="Hasil Rahang Atas" result={upperResult} />}
            {lowerResult && <ResultCard title="Hasil Rahang Bawah" result={lowerResult} />}
          </div>
        )}
      </div>
    </main>
  );
}

/* UI COMPONENTS */

function UploadCard({
  title,
  description,
  onFileChange,
  imageUrl,
}: {
  title: string;
  description: string;
  onFileChange: (file: File) => void;
  imageUrl: string | null;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 transition-all hover:shadow-md">
      <h2 className="text-xl font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-slate-500 text-sm mb-6">{description}</p>

      <div className="relative group cursor-pointer">
        <div className={`
          relative h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-colors
          ${imageUrl ? "border-emerald-500" : "border-slate-300 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300"}
        `}>
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="text-center p-4">
              <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">+</div>
              <p className="text-slate-600 font-medium">Klik untuk Pilih Gambar</p>
              <p className="text-slate-400 text-xs mt-1">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, result }: { title: string; result: PredictionResult }) {
  const isCaries = result.prediction === "caries";
  
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 overflow-hidden">
      <div className={`p-1 ${isCaries ? 'bg-orange-500' : 'bg-emerald-500'}`} />
      <div className="p-8">
        <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">{title}</h2>
        
        <div className="mb-8">
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-2 ${
            isCaries ? 'bg-orange-100 text-orange-700' : 
            result.prediction === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {result.prediction.toUpperCase()}
          </div>
          <div className="flex items-baseline">
            <span className="text-5xl font-black text-slate-800">{(result.confidence * 100).toFixed(0)}</span>
            <span className="text-2xl font-bold text-slate-400 ml-1">%</span>
            <span className="ml-3 text-slate-500 font-medium">Confidence</span>
          </div>
        </div>

        <div className="space-y-4">
          <ProgressBar label="Caries Prob." value={result.probabilities.caries} color="bg-orange-500" />
          <ProgressBar label="Healthy Prob." value={result.probabilities.healthy} color="bg-emerald-500" />
          <ProgressBar label="Non-Dental" value={result.probabilities.non_dental} color="bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-slate-600 mb-1 uppercase tracking-tighter">
        <span>{label}</span>
        <span>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}