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
          <div className="panel">Status / Controls</div>
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}
