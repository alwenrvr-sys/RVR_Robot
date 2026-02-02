import React, { useState } from "react";

export default function MLTeach() {
  const [logs, setLogs] = useState([
    "ML Teach initialized",
    "Waiting for image upload…",
  ]);

  return (
    <div className="mlteach-page">
      {/* ================= UPPER ================= */}
      <div className="mlteach-upper">
        {/* IMAGE PREVIEW */}
        <div className="mlteach-panel">
          <h4 className="mlteach-title">Image Preview</h4>

          <div className="mlteach-image">
            No image loaded
          </div>

          <div className="mlteach-btn-row">
            <button className="ml-btn neutral">Upload Image</button>
            <button className="ml-btn primary">Capture Camera</button>
          </div>
        </div>

        {/* CONSOLE */}
        <div className="mlteach-panel console">
          <h4 className="mlteach-title">Console</h4>

          <div className="mlteach-console">
            {logs.map((l, i) => (
              <div key={i}>• {l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= LOWER ================= */}
      <div className="mlteach-lower">
        <div className="mlteach-panel">
                  <div className="mlteach-status">
            <span>Status:</span>
            <b className="active"> TEACHING</b>
          </div>
        </div>
      </div>
    </div>
  );
}
