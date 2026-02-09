import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function Pathpreview() {
  const canvasRef = useRef(null);
  const { previewPaths } = useSelector((state) => state.app);

  useEffect(() => {
    if (!previewPaths || previewPaths.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 1;

    // ---- bounds ----
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    previewPaths.forEach((path) =>
      path.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }),
    );

    const scale = Math.min((W - 20) / (maxX - minX), (H - 20) / (maxY - minY));

    const offsetX = (W - (maxX - minX) * scale) / 2;
    const offsetY = (H - (maxY - minY) * scale) / 2;

    // ---- draw ----
    previewPaths.forEach((path) => {
      ctx.beginPath();
      path.forEach(([x, y], i) => {
        const px = offsetX + (x - minX) * scale;
        const py = H - (offsetY + (y - minY) * scale);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
    // ---- draw origin (0,0) ----
    const originPx = offsetX + (0 - minX) * scale;
    const originPy = H - (offsetY + (0 - minY) * scale);

    ctx.fillStyle = "#ecf841";
    ctx.beginPath();
    ctx.arc(originPx, originPy, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [previewPaths]);

  if (!previewPaths) {
    return <div className="joystick-preview empty">No DXF preview</div>;
  }

  return <canvas ref={canvasRef} className="path-canvas" />;
}
