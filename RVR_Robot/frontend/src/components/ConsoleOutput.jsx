import { useSelector } from "react-redux";

export default function ConsoleOutput() {
  const { running, stage, analysis, error, previewPaths, mode } = useSelector(
    (state) => state.app
  );

  const cameraAnalyze = useSelector((state) => state.camera.analyzeResult);

  const analyzeResult = running ? analysis : cameraAnalyze;
  const objects = analyzeResult?.objects || [];

  const isDrawMode = mode === "draw" || !!previewPaths;

  if (!objects.length && !previewPaths) {
    return (
      <div style={{ opacity: 0.6 }}>
        {running ? `Auto mode: ${stage}...` : "Waiting for analysis..."}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: 6,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* ===== HEADER ===== */}
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 12,
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {`Mode: ${
          running ? "AUTO PICK & PLACE" : isDrawMode ? "DRAW" : "MANUAL"
        }
Detected objects: ${objects.length}

`}
      </pre>

      {/* ===== OBJECTS ===== */}
      {objects.map((o, i) => (
        <pre
          key={i}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 12,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          <span style={{ color: "yellow", fontWeight: 600 }}>
            Object - {i + 1}
          </span>
          {"\n"}
          {"  "}Center (px): X={o.center_px?.[0].toFixed(1)}  Y=
          {o.center_px?.[1].toFixed(1)}
          {"\n"}
          {"  "}Theta: Rect={o.theta_rect.toFixed(2)}  PCA=
          {o.theta_pca.toFixed(2)}
          {"\n\n"}
          {"  "}Target:
          {"\n"}
          {"    "}X={o.target.target_X.toFixed(2)}
          {"\n"}
          {"    "}Y={o.target.target_Y.toFixed(2)}
          {"\n"}
          {"    "}Rz={o.target.target_Rz.toFixed(2)}
          {"\n\n"}
          {"  "}Edges:{" "}
          {o.inspection?.edges_mm?.length
            ? o.inspection.edges_mm.map((v) => v.toFixed(2)).join(", ")
            : "none"}
          {"\n"}
          {"  "}Circles:{" "}
          {o.inspection?.circles?.length
            ? o.inspection.circles
                .map(
                  (c, idx) =>
                    `D=${c.diameter_mm.toFixed(
                      2
                    )}mm (R=${c.radius_mm.toFixed(2)}mm)`
                )
                .join(", ")
            : "none"}
          {"\n\n"}
        </pre>
      ))}

      {/* ===== ERROR ===== */}
      {error && (
        <pre style={{ color: "red", margin: 0 }}>
          {"\n"}ERROR:{"\n"}
          {error}
        </pre>
      )}
    </div>
  );
}
