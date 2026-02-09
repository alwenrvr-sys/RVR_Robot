import React from "react";
import "../App.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import RightSidebar from "./RightSidebar";
import LeftSidebarPick from "./LeftSidebarPick";
import LeftSidebarDraw from "./LeftSidebarDraw";
import LeftSidebarSort from "./LeftSidebarSort";
import Imagepreview from "./Imagepreview";
import ConsoleOutput from "./ConsoleOutput";
import Pathpreview from "./Pathpreview";

export default function Joystick() {
  const [mode, setMode] = useState("pick");

  const { loading, autosetupLoading } = useSelector((state) => state.camera);

  const previewLoading = loading || autosetupLoading;

  return (
    <div className="joystick-layout">
      {mode === "pick" && <LeftSidebarPick onModeChange={setMode} />}
      {mode === "draw" && <LeftSidebarDraw onModeChange={setMode} />}
      {mode === "sort" && <LeftSidebarSort onModeChange={setMode} />}

      <main className="center">
        <div className="center-upper">
          <div className="upper-left">
            <div className="panel" style={{ position: "relative" }}>
              {previewLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 20,
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
