import { Button, InputNumber, Switch, Divider } from "antd";

export default function LeftSidebar() {
  return (
    <aside className="sidebar left antd-sidebar">

      {/* ================= ACTIONS ================= */}
      <h4 className="section-title">Actions</h4>

      <Button block>Upload Photo</Button>
      <Button block>Trigger Camera</Button>
      <Button block>Analyze</Button>
      <Button block>OCR</Button>

      <Button type="primary" block>
        Pick & Place
      </Button>

      <Button danger block>
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
        <InputNumber size="small" step={0.1} defaultValue={11.0} />
      </Field>

      <Field label="Scale Y (px/mm)">
        <InputNumber size="small" step={0.1} defaultValue={11.0} />
      </Field>

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
