"use client";

import { useState } from "react";
import Image from "next/image";
import { predictImageMock as predictImage, PredictionResult } from "@/lib/predict.mock";

type JawType = "upper" | "lower";

export default function Home() {
  const [upperResult, setUpperResult] = useState<PredictionResult | null>(null);
  const [lowerResult, setLowerResult] = useState<PredictionResult | null>(null);
  const [upperLoading, setUpperLoading] = useState(false);
  const [lowerLoading, setLowerLoading] = useState(false);
  const [upperImage, setUpperImage] = useState<string | null>(null);
  const [lowerImage, setLowerImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePredict(
    file: File,
    jawType: JawType
  ) {
    const setLoading = jawType === "upper" ? setUpperLoading : setLowerLoading;
    const setResult = jawType === "upper" ? setUpperResult : setLowerResult;
    const setImage = jawType === "upper" ? setUpperImage : setLowerImage;

    setLoading(true);
    setError(null);

    try {
      const img = document.createElement('img') as HTMLImageElement;
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      setImage(imageUrl);

      img.onload = async () => {
        try {
          const result = await predictImage(img);
          setResult(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Prediction failed");
          console.error("Prediction error:", err);
        } finally {
          setLoading(false);
        }
      };

      img.onerror = () => {
        setError("Failed to load image");
        setLoading(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "File processing failed");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dental Caries Detection
          </h1>
          <p className="text-gray-600">
            Upload dental images to detect caries using AI
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong className="font-semibold">Error: </strong>
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <UploadCard
            title="Upper Jaw"
            loading={upperLoading}
            onFileChange={(file) => handlePredict(file, "upper")}
            imageUrl={upperImage}
          />
          <UploadCard
            title="Lower Jaw"
            loading={lowerLoading}
            onFileChange={(file) => handlePredict(file, "lower")}
            imageUrl={lowerImage}
          />
        </div>

        {(upperResult || lowerResult) && (
          <div className="grid md:grid-cols-2 gap-6">
            {upperResult && (
              <ResultCard title="Upper Jaw" result={upperResult} imageUrl={upperImage} />
            )}
            {lowerResult && (
              <ResultCard title="Lower Jaw" result={lowerResult} imageUrl={lowerImage} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

interface UploadCardProps {
  title: string;
  loading: boolean;
  onFileChange: (file: File) => void;
  imageUrl: string | null;
}

function UploadCard({ title, loading, onFileChange, imageUrl }: UploadCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      {imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden relative h-88 bg-gray-100">
          <Image 
            src={imageUrl} 
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      
      <label className="cursor-pointer block">
        <div className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-3 px-4 rounded-lg text-center transition-colors">
          {loading ? "Processing..." : "Choose Image"}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileChange(file);
            }
          }}
        />
      </label>
    </div>
  );
}

interface ResultCardProps {
  title: string;
  result: PredictionResult;
  imageUrl: string | null;
}

function ResultCard({ title, result }: ResultCardProps) {
  const getStatusColor = (prediction: string) => {
    switch (prediction) {
      case "caries":
        return "text-red-600 bg-red-50 border-red-200";
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "non_dental":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (prediction: string) => {
    switch (prediction) {
      case "caries":
        return "Caries Detected";
      case "healthy":
        return "Healthy";
      case "non_dental":
        return "Non-Dental Image";
      default:
        return prediction;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      <div className={`rounded-lg p-4 mb-4 border-2 ${getStatusColor(result.prediction)}`}>
        <p className="text-lg font-bold mb-1">
          {getStatusLabel(result.prediction)}
        </p>
        <p className="text-sm opacity-90">
          Confidence: {(result.confidence * 100).toFixed(1)}%
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 text-sm mb-2">Probabilities:</h3>
        
        <div className="space-y-2">
          <ProbabilityBar
            label="Caries"
            value={result.probabilities.caries}
            color="bg-red-500"
          />
          <ProbabilityBar
            label="Healthy"
            value={result.probabilities.healthy}
            color="bg-green-500"
          />
          <ProbabilityBar
            label="Non-Dental"
            value={result.probabilities.non_dental}
            color="bg-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}

interface ProbabilityBarProps {
  label: string;
  value: number;
  color: string;
}

function ProbabilityBar({ label, value, color }: ProbabilityBarProps) {
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}