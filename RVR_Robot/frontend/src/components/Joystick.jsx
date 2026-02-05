import React from "react";
import "../App.css";
import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import Imagepreview from "./Imagepreview";

export default function Joystick() {
  return (
    <div className="joystick-layout">
      <LeftSidebar />

      {/* CENTER */}
      <main className="center">
        {/* UPPER (split) */}
        <div className="center-upper">
          <div className="upper-left">
            {/* Image / Camera Preview */}
            <div className="panel"><Imagepreview /></div>
          </div>

          <div className="upper-right">
            {/* Console */}
            <div className="panel console">Console Output</div>
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
