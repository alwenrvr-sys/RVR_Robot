import { Button, Divider, InputNumber } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { stopRobot } from "../appRedux/actions/Robot";
import { previewDXF, drawDXF } from "../appRedux/actions/Application";
import LeftFanMenu from "./LeftFanMenu";
import { useState } from "react";

export default function LeftSidebarDraw({ onModeChange }) {
  const dispatch = useDispatch();
  const { connected } = useSelector((state) => state.robot);
  const { loading, previewPaths } = useSelector((state) => state.app);

  // ---- Draw parameters ----
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);
  const [drawZ, setDrawZ] = useState(160);
  const [travelZ, setTravelZ] = useState(170);

  /* -------- Upload DXF -------- */
  const handleUploadDXF = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".dxf";

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      dispatch(previewDXF(file));
    };

    input.click();
  };
  
  /* -------- Run Sketch -------- */
  const handleRunSketch = () => {
    dispatch(
      drawDXF({
        origin_x: originX,
        origin_y: originY,
        draw_z: drawZ,
        travel_z: travelZ,
        rx: 180,
        ry: 0,
        rz: 45,
      }),
    );
  };

  return (
    <aside className="sidebar left antd-sidebar">
      <h4 className="section-title">Sketch / Draw</h4>

      <Button block onClick={handleUploadDXF} loading={loading}>
        Upload DXF
      </Button>

      <Divider />

      {/* ===== DRAW PARAMETERS ===== */}
      <h4 className="section-title">Draw Parameters</h4>

      <Field label="Origin X (mm)">
        <InputNumber size="small" value={originX} onChange={setOriginX} />
      </Field>

      <Field label="Origin Y (mm)">
        <InputNumber size="small" value={originY} onChange={setOriginY} />
      </Field>

      <Field label="Draw Z (mm)">
        <InputNumber size="small" value={drawZ} onChange={setDrawZ} />
      </Field>

      <Field label="Travel Z (mm)">
        <InputNumber size="small" value={travelZ} onChange={setTravelZ} />
      </Field>

      <Divider />

      {/* ===== RUN ===== */}
      <div className="pick-app-row">
        <Button
          type="primary"
          block
          disabled={!previewPaths}
          onClick={handleRunSketch}
        >
          Run Sketch
        </Button>

        <LeftFanMenu onSelect={onModeChange} />
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

      {/* ===== PRESETS ===== */}
      <h4 className="section-title">Presets</h4>

      <Button block>HOME-1</Button>
      <Button block>HOME-2</Button>
      <Button block>Focus-1</Button>
      <Button block>Focus-2</Button>

      <Button block type="dashed" style={{ marginTop: 8 }}>
        + Add Preset
      </Button>
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
