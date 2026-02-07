import { useSelector } from "react-redux";

export default function ConsoleOutput() {
  // 🔀 AUTO vs MANUAL
  const { running, stage, analysis, error } = useSelector((state) => state.app);

  const cameraAnalyze = useSelector((state) => state.camera.analyzeResult);

  const analyzeResult = running ? analysis : cameraAnalyze;

  if (!analyzeResult) {
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
    reason,
  } = analyzeResult;

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
      {`Mode:
  ${running ? "AUTO PICK & PLACE" : "MANUAL"}

Analyze:
  ${success ? "SUCCESS" : "FAILED"}

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

${
  !running
    ? `
Edges (mm):
  ${
    inspection?.edges_mm
      ? inspection.edges_mm.map((v) => v.toFixed(2)).join(", ")
      : "none"
  }
`
    : ""
}
${
  !running
    ? `
Holes: ${inspection?.holes?.length ?? 0}
`
    : ""
}
${
  !running
    ? `
OCR:
  ${ocr ?? "null"}
`
    : ""
}

${error ? `ERROR:\n  ${error}` : ""}
`}
    </pre>
  );
}
