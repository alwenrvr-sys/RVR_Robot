import { Button, InputNumber, Checkbox, Divider } from "antd";

export default function RightSidebar() {
  return (
    <aside className="sidebar right antd-sidebar">

      {/* ================= TARGET TCP ================= */}
      <h4 className="section-title">Target TCP</h4>

      {["X", "Y", "Z", "Rx", "Ry", "Rz"].map(k => (
        <div className="robot-field" key={k}>
          <label>{k}</label>
          <InputNumber size="small" />
        </div>
      ))}

      <Button type="primary" block>
        MOVE (PTP)
      </Button>

      <Button block>
        GET
      </Button>

      <Divider />

      {/* ================= OPTIONS ================= */}
      <h4 className="section-title">Options</h4>

      <Checkbox defaultChecked>
        Simulate before move (SimMoveJ if available)
      </Checkbox>

      <div className="robot-field">
        <label>Z lift (mm)</label>
        <InputNumber size="small" defaultValue={80.0} />
      </div>

      <Divider />

      {/* ================= PRESETS ================= */}
      <h4 className="section-title">Presets</h4>

      <Button block>HOME-1</Button>
      <Button block>HOME-2</Button>
      <Button block>Focus-1</Button>
      <Button block>Focus-2</Button>

      <Divider />

      {/* ================= CONTROL ================= */}
      <h4 className="section-title">Control</h4>

      <div className="btn-row">
        <Button danger block>STOP</Button>
        <Button block>CLEAR ERR</Button>
      </div>

      <div className="btn-row">
        <Button type="primary" block>ENABLE</Button>
        <Button block>DISABLE</Button>
      </div>

      <div className="btn-row">
        <Button block>AUTO MODE</Button>
        <Button block>MANUAL (DRAG)</Button>
      </div>

      <Button block>
        PICK / RELEASE
      </Button>

    </aside>
  );
}
