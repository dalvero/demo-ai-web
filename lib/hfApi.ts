import { Client, handle_file } from "@gradio/client";

export interface PredictionResult {
  prediction: string;
  confidence: number;
  probabilities: {
    caries: number;
    healthy: number;
    non_dental: number;
  };
}

export interface ApiResponse {
  upper_jaw: PredictionResult;
  lower_jaw: PredictionResult;
}

export async function predictWithHF(upperFile: File, lowerFile: File): Promise<ApiResponse> {
  try {
    const client = await Client.connect("dalvero/api-dental-ai");

    const result = await client.predict("/predict", {
      upper_img: handle_file(upperFile),
      lower_img: handle_file(lowerFile),
    });

    const dataArray = result.data as unknown[];
    const data = dataArray[0] as ApiResponse;

    if (!data) {
      throw new Error("No data returned from API");
    }

    return data;
  } catch (error) {
    console.error("HF API Error:", error);
    throw error;
  }
}