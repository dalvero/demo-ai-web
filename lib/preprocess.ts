import * as ort from "onnxruntime-web";

const IMG_SIZE = 224;

export function preprocessImage(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = IMG_SIZE;
  canvas.height = IMG_SIZE;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, IMG_SIZE, IMG_SIZE);

  const imageData = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
  const data = imageData.data;

  const float32 = new Float32Array(IMG_SIZE * IMG_SIZE * 3);

  let idx = 0;
  for (let i = 0; i < data.length; i += 4) {
    float32[idx++] = data[i] / 255;     // R
    float32[idx++] = data[i + 1] / 255; // G
    float32[idx++] = data[i + 2] / 255; // B
  }

  return new ort.Tensor("float32", float32, [1, 224, 224, 3]);
}
