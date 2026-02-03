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

      {/* ================= MOTION CONTROL ================= */}
      <h4 className="section-title">Motion Control</h4>

      <div className="robot-field">
        <label>Overall Speed (%)</label>
        <InputNumber size="small" min={1} max={100} defaultValue={50} />
      </div>

      <div className="robot-field">
        <label>Joint Velocity (%)</label>
        <InputNumber size="small" min={1} max={100} defaultValue={50} />
      </div>

      <div className="robot-field">
        <label>Joint Acceleration (%)</label>
        <InputNumber size="small" min={1} max={100} defaultValue={50} />
      </div>

      <div className="robot-field">
        <label>TCP Velocity (mm/s)</label>
        <InputNumber size="small" min={1} defaultValue={200} />
      </div>

      <div className="robot-field">
        <label>TCP Acceleration (mm/s²)</label>
        <InputNumber size="small" min={1} defaultValue={500} />
      </div>

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
