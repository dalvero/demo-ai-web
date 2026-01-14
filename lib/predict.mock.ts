// lib/predict.mock.ts
export type PredictionResult = {
  prediction: "caries" | "healthy" | "non_dental";
  confidence: number;
  probabilities: {
    caries: number;
    healthy: number;
    non_dental: number;
  };
};

export async function predictImageMock(
  _img: HTMLImageElement
): Promise<PredictionResult> {
  // simulasi delay biar UI tetap natural
  await new Promise((r) => setTimeout(r, 800));

  return {
    prediction: "healthy",
    confidence: 0.87,
    probabilities: {
      caries: 0.05,
      healthy: 0.87,
      non_dental: 0.08,
    },
  };
}
