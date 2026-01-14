import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('Unknown CPU vendor') || message.includes('cpuinfo_vendor')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

export async function getSession(): Promise<ort.InferenceSession> {
  if (!session) {
    ort.env.logLevel = 'error';
    session = await ort.InferenceSession.create(
      "/models/model_v2.onnx",
      {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      }
    );
  }
  return session;
}