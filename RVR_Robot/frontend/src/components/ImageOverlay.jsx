import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function ImageOverlay({ imgRef }) {
  const canvasRef = useRef(null);

  const { running, analysis } = useSelector((state) => state.app);
  const cameraAnalyze = useSelector((state) => state.camera.analyzeResult);

  const analyzeResult = running ? analysis : cameraAnalyze;

  useEffect(() => {
    if (!imgRef.current || !canvasRef.current || !analyzeResult) return;
    const analyze = analyzeResult;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // --- image displayed size ---
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- scale from image px → screen px ---
    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;

    const S = (p) => [p[0] * scaleX, p[1] * scaleY];

    /* ================= STATIC CENTER ================= */
    if (analyze.static_center_px) {
      const [x, y] = S(analyze.static_center_px);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.stroke();
    }

    /* ================= OBJECT CENTER ================= */
    if (analyze.center_px) {
      const [x, y] = S(analyze.center_px);
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ================= CONTOUR ================= */
    if (analyze.contour_px) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.beginPath();
      analyze.contour_px.forEach((p, i) => {
        const [x, y] = S(p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    /* ================= MIN AREA BOX ================= */
    if (analyze.box_px) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.beginPath();
      analyze.box_px.forEach((p, i) => {
        const [x, y] = S(p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    /* ================= EDGES + LENGTH ================= */
    if (analyze.edges_px && analyze.inspection?.edges_mm) {
      ctx.strokeStyle = "yellow";
      ctx.fillStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.font = "12px monospace";

      analyze.edges_px.forEach((p, i) => {
        const p1 = S(p);
        const p2 = S(analyze.edges_px[(i + 1) % analyze.edges_px.length]);

        ctx.beginPath();
        ctx.moveTo(...p1);
        ctx.lineTo(...p2);
        ctx.stroke();

        const mx = (p1[0] + p2[0]) / 2;
        const my = (p1[1] + p2[1]) / 2;

        ctx.fillText(
          `${analyze.inspection.edges_mm[i].toFixed(1)} mm`,
          mx + 4,
          my - 4,
        );
      });
    }

    /* ================= HOLES ================= */
    if (analyze.inspection?.holes) {
      ctx.strokeStyle = "cyan";
      ctx.fillStyle = "cyan";
      ctx.font = "12px monospace";

      analyze.inspection.holes.forEach((h) => {
        const [x, y] = S(h.center_px);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(`Ø ${h.diameter_mm.toFixed(2)} mm`, x + 8, y);
      });
    }
  }, [analyzeResult, imgRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    />
  );
}
