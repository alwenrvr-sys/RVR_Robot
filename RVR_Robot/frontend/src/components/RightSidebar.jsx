import { Button, InputNumber, Switch, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getTcp,
  setAutoMode,
  setManualMode,
  enableRobot,
  disableRobot,
  stopRobot,
  resetRobotErrors,
  moveL,
  pickUnpick,
} from "../appRedux/actions/Robot";
import { showNotification } from "../appRedux/actions/Notify";
import { useEffect, useState } from "react";

export default function RightSidebar() {
  const dispatch = useDispatch();
  const { moving, enabled, connected, mode, pose, loading } = useSelector(
    (state) => state.robot,
  );
  const [simulate, setSimulate] = useState(true);
  const [zLift, setZLift] = useState(0);
  const isDisabledState = enabled !== 1;
  const [tcp, setTcp] = useState({
    x: null,
    y: null,
    z: null,
    rx: null,
    ry: null,
    rz: null,
  });

  useEffect(() => {
    if (pose) {
      setTcp({
        x: pose.x,
        y: pose.y,
        z: pose.z,
        rx: pose.rx,
        ry: pose.ry,
        rz: pose.rz,
      });
    }
  }, [pose]);
  const updateField = (key, value) => {
    setTcp((prev) => ({ ...prev, [key]: value }));
  };

  const handleMoveL = () => {
    const pose = [tcp.x, tcp.y, tcp.z, tcp.rx, tcp.ry, tcp.rz];

    dispatch(
      moveL({
        pose,
        simulate,
        z_lift: simulate ? zLift : 0,
      }),
    );
  };

  return (
    <aside className="sidebar right antd-sidebar">
      {/* ================= TARGET TCP ================= */}
      <h4 className="section-title">Target TCP</h4>

      <div className="tcp-grid">
        {[
          ["x", "X"],
          ["y", "Y"],
          ["z", "Z"],
          ["rx", "Rx"],
          ["ry", "Ry"],
          ["rz", "Rz"],
        ].map(([key, label]) => (
          <div className="tcp-row" key={key}>
            <label className="tcp-label">{label}</label>
            <InputNumber
              size="small"
              value={tcp[key]}
              precision={2}
              step={0.01}
              onChange={(v) => updateField(key, v)}
              className="tcp-input"
            />
          </div>
        ))}
      </div>
      <div className="btn-row">
        <Button
          type="primary"
          block
          loading={moving}
          disabled={!connected || isDisabledState}
          onClick={handleMoveL}
        >
          MOVE (LINEAR)
        </Button>

        <Button
          block
          disabled={!connected || isDisabledState}
          onClick={() => {
            dispatch(getTcp());
          }}
        >
          GET
        </Button>
      </div>

      <Divider />
      {/* ================= OPTIONS ================= */}
      <h4 className="section-title">Options</h4>

      <div className="robot-field toggle-row">
        <label>Simulate before move</label>
        <Switch
          checked={simulate}
          onChange={(checked) => setSimulate(checked)}
        />
      </div>

      <div className="robot-field">
        <label>Z lift (mm)</label>
        <InputNumber
          size="small"
          min={0}
          step={1}
          value={zLift}
          disabled={!simulate}
          onChange={(v) => setZLift(v)}
        />
      </div>
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

      {/* ================= CONTROL ================= */}
      <h4 className="section-title">Control</h4>

      <div className="btn-row">
        <Button
          danger
          block
          disabled={!connected || isDisabledState}
          onClick={() => {
            dispatch(stopRobot());
          }}
        >
          STOP
        </Button>

        <Button
          block
          disabled={!connected || isDisabledState}
          onClick={() => {
            dispatch(resetRobotErrors());
          }}
        >
          CLEAR ERR
        </Button>
      </div>

      <div className="btn-row">
        <Button
          type={enabled === 1 ? "primary" : "default"}
          block
          onClick={() => {
            dispatch(enableRobot());
          }}
        >
          ENABLE
        </Button>
        <Button
          danger={enabled === 0}
          block
          onClick={() => {
            dispatch(disableRobot());
          }}
        >
          DISABLE
        </Button>
      </div>

      <div className="btn-row">
        <Button
          block
          type={mode === 0 ? "primary" : "default"}
          disabled={!connected || isDisabledState}
          onClick={() => {
            dispatch(setAutoMode());
            dispatch(showNotification("robot", "Automatic Mode"));
          }}
        >
          AUTO
        </Button>

        <Button
          block
          type={mode === 1 ? "primary" : "default"}
          disabled={!connected || isDisabledState}
          onClick={() => {
            dispatch(setManualMode());
            dispatch(
              showNotification("robot", "Manual Mode Now you can able to Drag"),
            );
          }}
        >
          MANUAL
        </Button>
      </div>

      <Button
        block
        loading={loading}
        onClick={() => {
          dispatch(pickUnpick());
        }}
        disabled={!connected || isDisabledState}
      >
        Pick & Place
      </Button>
    </aside>
  );
}
