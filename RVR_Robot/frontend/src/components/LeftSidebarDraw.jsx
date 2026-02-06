import { Button, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { stopRobot } from "../appRedux/actions/Robot";
import RightFanMenu from "./RightFanMenu";

export default function LeftSidebarDraw({ onModeChange }) {
  const dispatch = useDispatch();
  const { connected } = useSelector((state) => state.robot);

  return (
    <aside className="sidebar left antd-sidebar">
      <h4 className="section-title">Sketch / Draw</h4>

      <Button block>Upload File</Button>
      <Button block>Preview Path</Button>

      <div className="pick-app-row">
        <Button type="primary" block>
          Run Sketch
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
