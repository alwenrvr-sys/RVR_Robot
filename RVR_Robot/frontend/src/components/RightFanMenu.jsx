import { useState } from "react";
import {   AppstoreOutlined, } from "@ant-design/icons";
export default function RightFanMenu({ onSelect }) {
  const [open, setOpen] = useState(false);

  const items = [
    { key: "pick", label: "Pick" },
    { key: "draw", label: "Draw" },
    { key: "sort", label: "Sort" },
  ];

  return (
    <div className="fan-slot">
      <div
        className="fan-hover-zone"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className={`fan-menu ${open ? "open" : ""}`}>
          <button className="fan-main" onClick={() => setOpen((v) => !v)}>
            <  AppstoreOutlined />
          </button>

          {items.map((item, i) => (
            <button
              key={item.key}
              className={`fan-item item-${i}`}
              onClick={() => {
                onSelect?.(item.key);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
