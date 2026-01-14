import * as ort from "onnxruntime-web";
import { getSession } from "./onnx";
import { preprocessImage } from "./preprocess";

const CARIES_THRESHOLD = 0.35;

export type PredictionType = "caries" | "healthy" | "non_dental";

export interface PredictionResult {
  prediction: PredictionType;
  confidence: number;
  probabilities: {
    caries: number;
    healthy: number;
    non_dental: number;
  };
}

export async function predictImage(
  img: HTMLImageElement
): Promise<PredictionResult> {
  const session = await getSession();
  const inputTensor = preprocessImage(img);

  const feeds: Record<string, ort.Tensor> = {
    [session.inputNames[0]]: inputTensor,
  };

  const results = await session.run(feeds);
  const output = results[session.outputNames[0]].data as Float32Array;

  const [caries, healthy, nonDental] = output;

  let prediction: PredictionType = "healthy";
  let confidence = healthy;

  if (nonDental > 0.5) {
    prediction = "non_dental";
    confidence = nonDental;
  } else if (caries >= CARIES_THRESHOLD) {
    prediction = "caries";
    confidence = caries;
  }

  return {
    prediction,
    confidence,
    probabilities: {
      caries,
      healthy,
      non_dental: nonDental,
    },
  };
}