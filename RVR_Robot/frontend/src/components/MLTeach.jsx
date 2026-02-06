import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadLocalImage } from "../appRedux/actions/Camera";
import Imagepreview from "./Imagepreview";

export default function MLTeach() {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([
    "ML Teach initialized",
    "Waiting for image upload…",
  ]);
  const handleUploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result.split(",")[1]; // strip data:image/*
        dispatch(uploadLocalImage(base64));
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  return (
    <div className="mlteach-page">
      {/* ================= UPPER ================= */}
      <div className="mlteach-upper">
        {/* IMAGE PREVIEW */}
        <div className="mlteach-panel">
          <h4 className="mlteach-title">
            {" "}
            <Imagepreview />
          </h4>

          <div className="mlteach-btn-row">
            <button className="ml-btn neutral" onClick={handleUploadImage}>
              Upload Image
            </button>
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
