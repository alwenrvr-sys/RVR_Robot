import { Button, InputNumber, Switch, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { triggerCamera, analyzeImage ,uploadLocalImage} from "../appRedux/actions/Camera";
import { stopRobot } from "../appRedux/actions/Robot";
import RightFanMenu from "./RightFanMenu";

export default function LeftSidebarPick({ onModeChange }) {
  const dispatch = useDispatch();
  const { loading, result } = useSelector((state) => state.camera);
  const { pose } = useSelector((state) => state.robot);
  const { connected } = useSelector((state) => state.robot);

  const scaleX = result?.scale_x_px_per_mm;
  const scaleY = result?.scale_y_px_per_mm;

  const handleTriggerCamera = () => {
    if (!pose?.z) {
      console.warn("TCP Z not available");
      return;
    }
    dispatch(triggerCamera(pose.z));
  };
  const imageBase64 = result?.image_base64;

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
        white_thresh: 150,
        auto_thresh: true,
        enable_edges: true,
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
    <aside className="sidebar left antd-sidebar">
      {/* ================= ACTIONS ================= */}
      <h4 className="section-title">Pick & Place</h4>

      <Button block onClick={handleUploadImage}>
        Upload Photo
      </Button>

      <Button block loading={loading} onClick={handleTriggerCamera}>
        Trigger Camera
      </Button>
      <Button block onClick={handleAnalyze}>
        Analyze
      </Button>

      {/* ===== PICK & PLACE + APP SELECTOR ===== */}
      <div className="pick-app-row">
        <Button type="primary" block>
          Pick & Place
        </Button>

        <RightFanMenu onSelect={onModeChange} />
      </div>

      <Button
        danger
        block
        disabled={!connected}
        onClick={() => dispatch(stopRobot())}
      >
        STOP
      </Button>

      <Divider />

      {/* ================= IMAGE PROCESSING ================= */}
      <h4 className="section-title">Image Processing</h4>

      <Field label="Blur">
        <InputNumber size="small" defaultValue={5} />
      </Field>

      <Field label="MinArea (px²)">
        <InputNumber size="small" defaultValue={10} />
      </Field>

      <Toggle label="Check Dimension" />
      <Toggle label="Morph cleanup" defaultChecked />
      <Toggle label="Auto WhiteThresh" defaultChecked />

      <Field label="WhiteThresh">
        <InputNumber size="small" defaultValue={150} />
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

function Toggle({ label, defaultChecked }) {
  return (
    <div className="toggle-row">
      <span className="field-label">{label}</span>
      <Switch size="small" defaultChecked={defaultChecked} />
    </div>
  );
}
