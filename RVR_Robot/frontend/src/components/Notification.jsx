import { useEffect } from "react";

export default function Notification({
  tag,          // "robot" | "camera"
  message,
  visible,
  onClose,
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`status-notify ${tag}`}>
      {message}
    </div>
  );
}
