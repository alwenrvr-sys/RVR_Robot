import React from "react";
import "../App.css";
import { useState } from "react";
import RightSidebar from "./RightSidebar";
import LeftSidebarPick from "./LeftSidebarPick";
import LeftSidebarDraw from "./LeftSidebarDraw";
import LeftSidebarSort from "./LeftSidebarSort";
import Imagepreview from "./Imagepreview";
import ConsoleOutput from "./ConsoleOutput";
import Pathpreview from "./Pathpreview";

export default function Joystick() {
  const [mode, setMode] = useState("pick");
  return (
    <div className="joystick-layout">
      {mode === "pick" && <LeftSidebarPick onModeChange={setMode} />}
      {mode === "draw" && <LeftSidebarDraw onModeChange={setMode} />}
      {mode === "sort" && <LeftSidebarSort onModeChange={setMode} />}

      {/* CENTER */}
      <main className="center">
        {/* UPPER (split) */}
        <div className="center-upper">
          <div className="upper-left">
            <div className="panel">
              {mode === "draw" ? <Pathpreview /> : <Imagepreview />}
            </div>
          </div>

          <div className="upper-right">
            {/* Console */}
            <div className="panel console">
              <ConsoleOutput />
            </div>
          </div>
        </div>

        {/* LOWER */}
        <div className="center-lower">
          <div className="panel">Status / Controls</div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  );
}
