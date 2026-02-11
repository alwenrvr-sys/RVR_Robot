import { useEffect, useRef, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function ImageOverlay({ imgRef }) {
  const canvasRef = useRef(null);

  const { running, analysis } = useSelector((state) => state.app);
  const cameraAnalyze = useSelector((state) => state.camera.analyzeResult);

  const rawResult = running ? analysis : cameraAnalyze;

  /* ================= TOGGLE STATE ================= */
  const [show, setShow] = useState({
    edges: false,
    circles: true,
    width: false,
    height: false,
    area: true,
    perimeter: false,
  });

  /* ================= NORMALIZE RESPONSE ================= */
  const analyzeResult = useMemo(() => {
    if (!rawResult || rawResult.success === false) return null;

    if (Array.isArray(rawResult.objects)) return rawResult;

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

    const drawnLabels = [];

    function placeLabel(x, y, w, h) {
      let ly = y;
      let collision = true;

      while (collision) {
        collision = false;
        for (const r of drawnLabels) {
          const overlap =
            x < r.x + r.w && x + w > r.x && ly < r.y + r.h && ly + h > r.y;

          if (overlap) {
            ly -= h + 4;
            collision = true;
            break;
          }
        }
      }

      drawnLabels.push({ x, y: ly, w, h });
      return ly;
    }

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

    /* ===== STATIC CENTER ===== */
    const staticCenter =
      analyzeResult.objects[0]?.static_center_px ?? rawResult?.static_center_px;

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

      /* Center */
      if (obj.center_px) {
        const [x, y] = S(obj.center_px);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Contour */
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

      /* Bounding box (skip circles) */
      if (obj.box_px && !obj.inspection?.circles?.length) {
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

      /* ===== EDGES ===== */
      if (show.edges && obj.edges_px && obj.inspection?.edges_mm) {
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
            my - 4,
          );
        });
      }

      /* ===== CIRCLES ===== */
      if (show.circles && obj.inspection?.circles?.length) {
        ctx.strokeStyle = "cyan";
        ctx.fillStyle = "cyan";
        ctx.font = "12px monospace";

        obj.inspection.circles.forEach((c) => {
          const [cx, cy] = S(c.center_px);

          ctx.beginPath();
          ctx.arc(cx, cy, c.radius_px * scaleX, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillText(`Ø ${c.diameter_mm.toFixed(2)} mm`, cx + 8, cy - 6);
        });
      }

      /* ===== DIMENSIONS ===== */
      if (show.width || show.height || show.area || show.perimeter) {
        const [cx, cy] = S(obj.center_px || [0, 0]);
        ctx.font = "12px monospace";

        let lines = [];

        if (show.width && obj.inspection?.width_mm != null)
          lines.push(`W: ${obj.inspection.width_mm.toFixed(2)} mm`);

        if (show.height && obj.inspection?.height_mm != null)
          lines.push(`H: ${obj.inspection.height_mm.toFixed(2)} mm`);

        if (show.area && obj.inspection?.area_mm2 != null)
          lines.push(`A: ${obj.inspection.area_mm2.toFixed(2)} mm²`);

        if (show.perimeter && obj.inspection?.perimeter_mm != null)
          lines.push(`P: ${obj.inspection.perimeter_mm.toFixed(2)} mm`);

        if (lines.length) {
          const padding = 6;
          const lineHeight = 14;
          const width =
            Math.max(...lines.map((l) => ctx.measureText(l).width)) +
            padding * 2;
          const height = lines.length * lineHeight + padding * 2;

          const x = cx + 15;
          const y = cy + 15;

          ctx.fillStyle = "rgba(0,0,0,0.75)";
          ctx.fillRect(x, y, width, height);

          ctx.strokeStyle = "white";
          ctx.strokeRect(x, y, width, height);

          ctx.fillStyle = "white";
          lines.forEach((line, i) => {
            ctx.fillText(
              line,
              x + padding,
              y + padding + (i + 1) * lineHeight - 4,
            );
          });
        }
      }

      /* ===== ID LABEL ===== */
      if (obj.center_px) {
        const [x, y] = S(obj.center_px);
        const label = `${idx + 1}`;

        ctx.font = "bold 12px sans-serif";
        const w = ctx.measureText(label).width + 8;
        const h = 16;

        const lx = x + 8;
        const ly = placeLabel(lx, y - 22, w, h);

        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(lx, ly, w, h);

        ctx.strokeStyle = "white";
        ctx.strokeRect(lx, ly, w, h);

        ctx.fillStyle = "white";
        ctx.fillText(label, lx + 4, ly + 12);
      }
    });
  }, [analyzeResult, rawResult, imgRef, show]);

  return (
    <>
      {/* ===== TOGGLE PANEL (NO BACKGROUND) ===== */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: 4,
          fontSize: 12,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          zIndex: 10,
        }}
      >
        {Object.keys(show).map((key) => (
          <label
            key={key}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#222",
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={show[key]}
              onChange={() =>
                setShow((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
            />
            {key}
          </label>
        ))}
      </div>

      {/* ===== CANVAS ===== */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
