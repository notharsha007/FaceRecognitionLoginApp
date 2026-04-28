import type { FaceDetection } from "face-api.js";

export function drawFaceBox(
  ctx: CanvasRenderingContext2D,
  detection: FaceDetection,
  displayW: number,
  displayH: number,
  naturalW: number,
  naturalH: number
) {
  const scaleX = displayW / naturalW;
  const scaleY = displayH / naturalH;
  const { x, y, width, height } = detection.box;
  const bx = x * scaleX;
  const by = y * scaleY;
  const bw = width * scaleX;
  const bh = height * scaleY;

  // Bounding box
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  // Corner accents
  const cs = 16;
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(bx, by + cs); ctx.lineTo(bx, by); ctx.lineTo(bx + cs, by); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw - cs, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cs); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx, by + bh - cs); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cs, by + bh); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw - cs, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cs); ctx.stroke();

  // "Face Detected" badge
  const label = "Face Detected";
  ctx.font = "bold 13px sans-serif";
  const textW = ctx.measureText(label).width;
  const badgeX = bx;
  const badgeY = by > 28 ? by - 28 : by + bh + 6;
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(label, badgeX + 8, badgeY + 15);
}
