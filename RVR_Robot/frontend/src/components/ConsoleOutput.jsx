import { useSelector } from "react-redux";

export default function ConsoleOutput() {
  const { running, stage, analysis, error, previewPaths, mode } = useSelector(
    (state) => state.app,
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
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 12,
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {`Mode: ${running ? "AUTO PICK & PLACE" : isDrawMode ? "DRAW" : "MANUAL"}
Detected objects: ${objects.length}

${objects
  .map(
    (o, i) => `
Object #${i + 1}
  Center (px): X=${o.center_px?.[0].toFixed(1)}  Y=${o.center_px?.[1].toFixed(1)}
  Theta: Rect=${o.theta_rect.toFixed(2)}  PCA=${o.theta_pca.toFixed(2)}

  Target:
    X=${o.target.target_X.toFixed(2)}
    Y=${o.target.target_Y.toFixed(2)}
    Rz=${o.target.target_Rz.toFixed(2)}

  Edges: ${
    o.inspection?.edges_mm?.length
      ? o.inspection.edges_mm.map((v) => v.toFixed(2)).join(", ")
      : "none"
  }
  Holes: ${o.inspection?.holes?.length ?? 0}
`,
  )
  .join("\n")}
${error ? `\nERROR:\n${error}` : ""}
`}
      </pre>
    </div>
  );
}
