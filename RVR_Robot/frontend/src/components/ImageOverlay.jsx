import { useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";

export default function ImageOverlay({ imgRef }) {
  const canvasRef = useRef(null);

  const { running, analysis } = useSelector((state) => state.app);
  const cameraAnalyze = useSelector((state) => state.camera.analyzeResult);

  const rawResult = running ? analysis : cameraAnalyze;

  /* ================= NORMALIZE RESPONSE ================= */
  const analyzeResult = useMemo(() => {
    if (!rawResult || rawResult.success === false) return null;

    // ✅ Multi-object response
    if (Array.isArray(rawResult.objects)) {
      return rawResult;
    }

    // ✅ Single-object response → wrap as one object
    return {
      success: true,
      objects: [
        {
          center_px: rawResult.center_px,
          static_center_px: rawResult.static_center_px,
          contour_px: rawResult.contour_px,
          box_px: rawResult.box_px,
          edges_px: rawResult.edges_px,
          inspection: rawResult.inspection,
          target: rawResult.target,
          ocr: rawResult.ocr,
          distance_mm: rawResult.distance_mm,
          theta_rect: rawResult.theta_rect,
          theta_pca: rawResult.theta_pca,
        },
      ],
    };
  }, [rawResult]);

  useEffect(() => {
    if (
      !imgRef.current ||
      !canvasRef.current ||
      !analyzeResult?.objects?.length
    )
      return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;
    const S = (p) => [p[0] * scaleX, p[1] * scaleY];

    /* ===== STATIC CENTER (draw once) ===== */
    const staticCenter =
      analyzeResult.objects[0]?.static_center_px ??
      rawResult?.static_center_px;

    if (staticCenter) {
      const [x, y] = S(staticCenter);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x + 12, y);
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, y + 12);
      ctx.stroke();
    }

    /* ===== DRAW EACH OBJECT ===== */
    analyzeResult.objects.forEach((obj, idx) => {
      const color = ["red", "lime", "cyan", "orange", "magenta"][idx % 5];

      /* center */
      if (obj.center_px) {
        const [x, y] = S(obj.center_px);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ID label */
      if (obj.center_px) {
        const [x, y] = S(obj.center_px);
        const label = `${idx + 1}`;

        ctx.font = "bold 12px sans-serif";
        const w = ctx.measureText(label).width + 8;

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(x + 8, y - 22, w, 16);

        ctx.strokeStyle = "white";
        ctx.strokeRect(x + 8, y - 22, w, 16);

        ctx.fillStyle = "white";
        ctx.fillText(label, x + 12, y - 10);
      }

      /* contour */
      if (obj.contour_px) {
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.beginPath();
        obj.contour_px.forEach((p, i) => {
          const [x, y] = S(p);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      }

      /* bounding box */
      if (obj.box_px) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.beginPath();
        obj.box_px.forEach((p, i) => {
          const [x, y] = S(p);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      }

      /* edges + length */
      if (obj.edges_px && obj.inspection?.edges_mm) {
        ctx.strokeStyle = "yellow";
        ctx.fillStyle = "yellow";
        ctx.font = "12px monospace";

        obj.edges_px.forEach((p, i) => {
          const p1 = S(p);
          const p2 = S(obj.edges_px[(i + 1) % obj.edges_px.length]);

          ctx.beginPath();
          ctx.moveTo(...p1);
          ctx.lineTo(...p2);
          ctx.stroke();

          const mx = (p1[0] + p2[0]) / 2;
          const my = (p1[1] + p2[1]) / 2;

          ctx.fillText(
            `${obj.inspection.edges_mm[i].toFixed(1)} mm`,
            mx + 4,
            my - 4
          );
        });
      }

      /* holes */
      if (obj.inspection?.holes) {
        ctx.strokeStyle = "cyan";
        ctx.fillStyle = "cyan";
        ctx.font = "12px monospace";

        obj.inspection.holes.forEach((h) => {
          const [x, y] = S(h.center_px);
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillText(`Ø ${h.diameter_mm.toFixed(2)} mm`, x + 8, y);
        });
      }
    });
  }, [analyzeResult, rawResult, imgRef]);

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
