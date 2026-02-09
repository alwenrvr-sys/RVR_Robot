import { Button, InputNumber, Switch, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  triggerCamera,
  analyzeImage,
  uploadLocalImage,
  runAutosetup,
} from "../appRedux/actions/Camera";
import { getTcp } from "../appRedux/actions/Robot";
import {
  startAutoPick,
  stopAutoPick,
  resetAnalysis,
} from "../appRedux/actions/Application";
import RightFanMenu from "./RightFanMenu";

export default function LeftSidebarPick({ onModeChange }) {
  const dispatch = useDispatch();
  const { loading, result } = useSelector((state) => state.camera);
  const { autosetupLoading } = useSelector((state) => state.camera);
  const { pose } = useSelector((state) => state.robot);
  const { connected } = useSelector((state) => state.robot);
  const { image_base64, running } = useSelector(
    (state) => state.app,
  );
  const [zValue, setZValue] = useState(null);
  const isAuto = running;
  const uiLocked = autosetupLoading || isAuto;
  const [imageParams, setImageParams] = useState({
    blur: 5,
    minArea: 10,
    enable_edges: false,
    morphCleanup: true,
    autoWhiteThresh: true,
    whiteThresh: 150,
  });
  const updateParam = (key, value) => {
    setImageParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    dispatch(getTcp());
    dispatch(resetAnalysis());
  }, [dispatch]);

  useEffect(() => {
    if (pose?.z == null) return;

    setZValue(pose.z);
    console.log("Current Z value:", pose.z);
  }, [pose?.z]);

  const scaleX = result?.scale_x_px_per_mm;
  const scaleY = result?.scale_y_px_per_mm;

  const handleTriggerCamera = () => {
    if (!zValue) {
      console.warn("TCP Z not available");
      return;
    }
    dispatch(triggerCamera(zValue));
  };

  const imageBase64 = isAuto ? image_base64 : result?.image_base64;

  const handleAnalyze = () => {
    if (!imageBase64) {
      console.warn("No image captured");
      return;
    }

    if (!pose) {
      console.warn("TCP not available");
      return;
    }

    dispatch(
      analyzeImage({
        image_base64: imageBase64,
        tcp: [pose.x, pose.y, pose.z, pose.rx, pose.ry, pose.rz],
        white_thresh: imageParams.whiteThresh,
        auto_thresh: imageParams.autoWhiteThresh,
        enable_edges: imageParams.enable_edges,
      }),
    );
  };

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
    <aside
      className="sidebar left antd-sidebar"
      style={{
        pointerEvents: uiLocked ? "none" : "auto",
        opacity: uiLocked ? 0.5 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* ================= ACTIONS ================= */}
      <h4 className="section-title">Pick & Place</h4>

      <Button block onClick={handleUploadImage}>
        Upload Photo
      </Button>

      <Button
        block
        loading={autosetupLoading}
        disabled={uiLocked}
        onClick={() => dispatch(runAutosetup())}
      >
        Run AutoSetup
      </Button>

      <Button
        block
        loading={loading}
        disabled={isAuto}
        onClick={handleTriggerCamera}
      >
        Trigger Camera
      </Button>

      <Button block disabled={isAuto} onClick={handleAnalyze}>
        Analyze
      </Button>

      {/* ===== PICK & PLACE + APP SELECTOR ===== */}
      <div className="pick-app-row">
        <Button
          type="primary"
          block
          disabled={running}
          onClick={() => dispatch(startAutoPick())}
        >
          {running ? "AUTO RUNNING…" : "Pick & Place"}
        </Button>

        <RightFanMenu onSelect={onModeChange} />
      </div>

      <Button
        danger
        block
        disabled={!connected}
        onClick={() => {
          dispatch(resetAnalysis());
          dispatch(stopAutoPick());
        }}
      >
        STOP
      </Button>
      <Divider />

      {/* ================= IMAGE PROCESSING ================= */}
      <h4 className="section-title">Image Processing</h4>

      <Field label="Blur">
        <InputNumber
          size="small"
          min={0}
          value={imageParams.blur}
          onChange={(v) => updateParam("blur", v)}
        />
      </Field>

      <Field label="MinArea (px²)">
        <InputNumber
          size="small"
          min={0}
          value={imageParams.minArea}
          onChange={(v) => updateParam("minArea", v)}
        />
      </Field>

      <Toggle
        label="Check Dimensions"
        checked={imageParams.enable_edges}
        onChange={(v) => {
          updateParam("enable_edges", v);

          if (!imageBase64 || !pose || isAuto) return;

          dispatch(
            analyzeImage({
              image_base64: imageBase64,
              tcp: [pose.x, pose.y, pose.z, pose.rx, pose.ry, pose.rz],
              white_thresh: imageParams.whiteThresh,
              auto_thresh: imageParams.autoWhiteThresh,
              enable_edges: v, // IMPORTANT: use v
            }),
          );
        }}
      />

      <Toggle
        label="Auto WhiteThresh"
        checked={imageParams.autoWhiteThresh}
        onChange={(v) => updateParam("autoWhiteThresh", v)}
      />

      <Field label="WhiteThresh">
        <InputNumber
          size="small"
          min={0}
          value={imageParams.whiteThresh}
          disabled={imageParams.autoWhiteThresh}
          onChange={(v) => updateParam("whiteThresh", v)}
        />
      </Field>

      <Divider />

      {/* ================= CALIBRATION ================= */}
      <h4 className="section-title">Calibration</h4>

      <Field label="Scale X (px/mm)">
        <InputNumber size="small" step={0.1} precision={3} value={scaleX} />
      </Field>

      <Field label="Scale Y (px/mm)">
        <InputNumber size="small" step={0.1} precision={3} value={scaleY} />
      </Field>

      <h4 className="section-title">Presets</h4>

      <Button block>HOME-1</Button>
      <Button block>HOME-2</Button>
      <Button block>Focus-1</Button>
      <Button block>Focus-2</Button>

      <Button block type="dashed" style={{ marginTop: 8 }}>
        + Add Preset
      </Button>

      <Divider />
    </aside>
  );
}

/* ================= REUSABLE UI ================= */

function Field({ label, children }) {
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="toggle-row">
      <span className="field-label">{label}</span>
      <Switch size="small" checked={checked} onChange={onChange} />
    </div>
  );
}
