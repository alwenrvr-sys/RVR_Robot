import { useState, useRef, useEffect } from "react";
import { AppstoreOutlined } from "@ant-design/icons";

export default function RightFanMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const items = [
    { key: "pick", label: "Pick" },
    { key: "draw", label: "Draw" },
    { key: "sort", label: "Sort" },
  ];

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="fan-slot" ref={ref}>
      <div className={`fan-menu ${open ? "open" : ""}`}>
        <button
          className="fan-main"
          onClick={() => setOpen((v) => !v)}
        >
          <AppstoreOutlined />
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
  );
}
