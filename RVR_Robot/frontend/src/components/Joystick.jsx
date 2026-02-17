import React from "react";
import "../App.css";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Spin, message } from "antd";
import RightSidebar from "./RightSidebar";
import LeftSidebarPick from "./LeftSidebarPick";
import LeftSidebarDraw from "./LeftSidebarDraw";
import LeftSidebarSort from "./LeftSidebarSort";
import Imagepreview from "./Imagepreview";
import ConsoleOutput from "./ConsoleOutput";
import Pathpreview from "./Pathpreview";
import { setJoystickMode } from "../appRedux/actions/Joystick";

export default function Joystick() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.joystick.mode);
  const plan = useSelector((state) => state.robot.plan);

  const { loading, autosetupLoading } = useSelector((state) => state.camera);

  const previewLoading = loading || autosetupLoading;
  const changeMode = (newMode) => {
    dispatch(setJoystickMode(newMode));
  };
  useEffect(() => {
    message.success({
      content: `Switched to ${mode.toUpperCase()} mode`,
      key: "mode-change",
      duration: 1.5,
    });
  }, [mode]);
  return (
    <div className="joystick-layout">
      {mode === "pick" && <LeftSidebarPick onModeChange={changeMode} />}
      {mode === "draw" && <LeftSidebarDraw onModeChange={changeMode} />}
      {mode === "sort" && <LeftSidebarSort onModeChange={changeMode} />}
      <main className="center">
        <div className="center-upper">
          <div className="upper-left">
            <div className="panel" style={{ position: "relative" }}>
              {previewLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgb(255, 255, 255)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    borderRadius: 12,
                  }}
                >
                  <Spin size="large" tip="Camera processing…" />
                </div>
              )}

              {mode === "draw" ? <Pathpreview /> : <Imagepreview />}
            </div>
          </div>

          <div className="upper-right">
            <div className="panel console">
              <ConsoleOutput />
            </div>
          </div>
        </div>

        <div className="center-lower">
          <div className="panel">
            {plan ? (
              <div style={{ fontFamily: "monospace", fontSize: 13 }}>
                <h4>Planned Path (A → C → B)</h4>

                <p>
                  <b>A:</b> {plan.A_tcp.map((v) => v.toFixed(2)).join(", ")}
                </p>
                <p>
                  <b>C:</b> {plan.C_tcp.map((v) => v.toFixed(2)).join(", ")}
                </p>
                <p>
                  <b>B:</b> {plan.B_tcp.map((v) => v.toFixed(2)).join(", ")}
                </p>

                <hr />

                <p>A→C: {plan.distance_mm.A_to_C} mm</p>
                <p>C→B: {plan.distance_mm.C_to_B} mm</p>
                <p>
                  <b>Total: {plan.distance_mm.total} mm</b>
                </p>

                <hr />

                <p>
                  <b>IK C:</b>
                </p>
                <p>{plan.ik_joints.C.map((v) => v.toFixed(2)).join(", ")}</p>

                <p>
                  <b>IK B:</b>
                </p>
                <p>{plan.ik_joints.B.map((v) => v.toFixed(2)).join(", ")}</p>
              </div>
            ) : (
              "Plan Preview"
            )}
          </div>
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}
