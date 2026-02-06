import React, { useState } from "react";
import Imagepreview from "./Imagepreview";
import { useDispatch } from "react-redux";
import { uploadLocalImage } from "../appRedux/actions/Camera";

export default function MLTrain() {
  const [tab, setTab] = useState("single");

  return (
    <div className="ml-page">
      {/* ================= TABS ================= */}
      <div className="ml-tabbar">
        <div
          className={`ml-tab-item ${tab === "single" ? "active" : ""}`}
          onClick={() => setTab("single")}
        >
          Single Identify
        </div>

        <div
          className={`ml-tab-item ${tab === "bulk" ? "active" : ""}`}
          onClick={() => setTab("bulk")}
        >
          Bulk Teach (Folder)
        </div>
      </div>

      {tab === "single" ? <SingleIdentify /> : <BulkTeach />}
    </div>
  );
}

/* ================================================= */
/* ================= SINGLE IDENTIFY ================ */
/* ================================================= */

function SingleIdentify() {
  const dispatch = useDispatch();
  const [roi, setRoi] = useState(false);
  const [outline, setOutline] = useState(false);
  const [autoUnknown, setAutoUnknown] = useState(true);
  const [fastIndex, setFastIndex] = useState(true);
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
    <div className="ml-grid">
      {/* LEFT */}
      <div className="ml-panel">
        <h4 className="ml-title">Input / Crop</h4>

        <div className="ml-image-preview">
          {" "}
          <Imagepreview />
        </div>

        <div className="ml-btn-group">
          <button className="ml-btn neutral" onClick={handleUploadImage}>
            Upload Image
          </button>
          <button className="ml-btn neutral">Paste Image</button>
          <button className="ml-btn primary">Identify</button>
        </div>

        <div className="ml-toggle-row">
          <Toggle
            label="Manual Select (ROI)"
            value={roi}
            onClick={() => setRoi(!roi)}
          />
          <Toggle
            label="Manual Outline"
            value={outline}
            onClick={() => setOutline(!outline)}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="ml-panel ml-right">
        <Section title="Prediction">
          <div className="ml-kv">
            <b>Label:</b> —
          </div>
          <div className="ml-kv">
            <b>Confidence:</b> —
          </div>
          <div className="ml-kv">
            <b>Crop:</b> —
          </div>
        </Section>

        <Section title="Controls">
          <label>
            K <input type="number" defaultValue={7} />
          </label>
          <label>
            Unknown if conf &lt;{" "}
            <input type="number" step="0.1" defaultValue={0.4} />
          </label>
          <label>
            Enable Accept if conf ≥{" "}
            <input type="number" step="0.1" defaultValue={0.65} />
          </label>

          <div className="ml-toggle-row">
            <Toggle
              label="Auto-set Unknown under threshold"
              value={autoUnknown}
              onClick={() => setAutoUnknown(!autoUnknown)}
            />
            <Toggle
              label="Use fast index (HNSW)"
              value={fastIndex}
              onClick={() => setFastIndex(!fastIndex)}
            />
          </div>

          <label>
            Filter tag
            <select>
              <option>(all)</option>
            </select>
          </label>
        </Section>

        <Section title="Top Matches">
          <div className="ml-list-box">—</div>
        </Section>

        <Section title="Add to Dataset">
          <input placeholder="Label" />
          <input placeholder="Tags (electronics>tv)" />

          <div className="ml-btn-group">
            <button className="ml-btn neutral">Save Manual</button>
            <button className="ml-btn primary">Accept & Save</button>
            <button className="ml-btn neutral">Clear</button>
            <button className="ml-btn neutral">Rebuild Features</button>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ================================================= */
/* ================= BULK TEACH ===================== */
/* ================================================= */

function BulkTeach() {
  const [smartCrop, setSmartCrop] = useState(true);
  const [previewEach, setPreviewEach] = useState(true);

  return (
    <div className="ml-bulk">
      <div className="ml-panel">
        <h4 className="ml-title">Bulk Teach from Folder</h4>

        <div className="ml-bulk-top">
          <span>Folder</span>
          <input placeholder="Select folder…" />
          <button className="ml-btn neutral">Select Folder</button>

          <input placeholder="Label (all images)" />
          <input placeholder="Tags (comma / hierarchy)" />

          <Toggle
            label="Smart Crop"
            value={smartCrop}
            onClick={() => setSmartCrop(!smartCrop)}
          />
          <Toggle
            label="Preview each"
            value={previewEach}
            onClick={() => setPreviewEach(!previewEach)}
          />

          <button className="ml-btn primary">Start Bulk Teach</button>
          <button className="ml-btn danger">Stop</button>
        </div>
      </div>

      <div className="ml-panel">
        <h4 className="ml-title">Bulk Preview</h4>
        <div className="ml-bulk-preview">Preview</div>

        <div className="ml-btn-group">
          <button className="ml-btn primary">Keep</button>
          <button className="ml-btn neutral">Skip</button>
          <button className="ml-btn danger">Stop</button>
        </div>
      </div>

      <div className="ml-panel">
        <h4 className="ml-title">Bulk Log</h4>
        <textarea className="ml-log" rows={5} placeholder="Logs…" />
      </div>
    </div>
  );
}

/* ================================================= */
/* ================= HELPERS ======================== */
/* ================================================= */

function Section({ title, children }) {
  return (
    <div className="ml-section">
      <h4 className="ml-title">{title}</h4>
      {children}
    </div>
  );
}

function Toggle({ label, value, onClick }) {
  return (
    <div className="ml-toggle" onClick={onClick}>
      <div className={`ml-switch ${value ? "on" : ""}`} />
      <span>{label}</span>
    </div>
  );
}
