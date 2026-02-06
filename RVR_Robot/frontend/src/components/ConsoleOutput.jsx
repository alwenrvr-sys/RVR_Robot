import { useSelector } from "react-redux";

export default function ConsoleOutput() {
  const analyzeResult = useSelector((state) => state.camera.analyzeResult);
  if (!analyzeResult) {
    return <div style={{ opacity: 0.6 }}>Waiting for analysis...</div>;
  }
  console.log("analyse result:", analyzeResult);
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
      {`✔ Analyze: ${success ? "SUCCESS" : "FAILED"}

Center (px):
  X: ${center_px?.[0]?.toFixed(2)}
  Y: ${center_px?.[1]?.toFixed(2)}

Target:
  X: ${target?.target_X?.toFixed(2)}
  Y: ${target?.target_Y?.toFixed(2)}
  Rz: ${target?.target_Rz?.toFixed(2)}

Theta:
  Rect: ${theta_rect?.toFixed(2)}
  PCA:  ${theta_pca?.toFixed(2)}

Inspection:
  Edges (mm): ${inspection?.edges_mm?.map((v) => v.toFixed(2)).join(", ") || "none"}
  Holes: ${inspection?.holes?.length || 0}

OCR:
  ${ocr ?? "null"}

Reason:
  ${reason ?? "none"}
`}
    </pre>
  );
}
