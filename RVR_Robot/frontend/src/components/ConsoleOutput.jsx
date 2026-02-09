import { useSelector } from "react-redux";

export default function ConsoleOutput() {
  const { running, stage, analysis, error, previewPaths, mode } =
    useSelector((state) => state.app);

  const cameraAnalyze = useSelector(
    (state) => state.camera.analyzeResult
  );

  // Prefer analysis when running, otherwise camera result
  const analyzeResult = running ? analysis : cameraAnalyze;

  const isDrawMode = mode === "draw" || !!previewPaths;

  if (!analyzeResult && !previewPaths) {
    return (
      <div style={{ opacity: 0.6 }}>
        {running ? `Auto mode: ${stage}...` : "Waiting for analysis..."}
      </div>
    );
  }

  const {
    success,
    center_px,
    theta_rect,
    theta_pca,
    target,
    inspection,
    ocr,
  } = analyzeResult || {};

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
{`Mode:${running ? "AUTO PICK & PLACE" : isDrawMode ? "DRAW" : "MANUAL"}
${!isDrawMode? `
  Center (px):
  X: ${center_px?.[0]?.toFixed(2) ?? "-"}
  Y: ${center_px?.[1]?.toFixed(2) ?? "-"}

Target:
  X: ${target?.target_X?.toFixed(2) ?? "-"}
  Y: ${target?.target_Y?.toFixed(2) ?? "-"}
  Rz: ${target?.target_Rz?.toFixed(2) ?? "-"}

Theta:
  Rect: ${theta_rect?.toFixed(2) ?? "-"}
  PCA:  ${theta_pca?.toFixed(2) ?? "-"}
`
    : ""
}

${
  !running && !isDrawMode
    ? `Edges (mm):
  ${
    inspection?.edges_mm?.length
      ? inspection.edges_mm.map((v) => v.toFixed(2)).join(", ")
      : "none"
  }

Holes: ${inspection?.holes?.length ?? 0}

OCR:
  ${ocr ?? "null"}
`
    : ""
}

${
  isDrawMode
    ? `Paths: ${previewPaths?.length ?? 0}
`
    : ""
}

${error ? `ERROR:\n  ${error}` : ""}
`}
    </pre>
  );
}
