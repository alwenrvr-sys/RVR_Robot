import { useSelector } from "react-redux";
import { Spin } from "antd";

export default function Imagepreview() {
  const { loading, result, error } = useSelector((state) => state.camera);

  if (loading) {
    return (
      <div className="joystick-preview loading">
        <Spin
          tip="Capturing image..."
          size="large"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="joystick-preview error">
        Camera error
      </div>
    );
  }

  if (!result?.image_base64) {
    return (
      <div className="joystick-preview empty">
        No image
      </div>
    );
  }

  return (
    <div className="joystick-preview">
      <img
        src={`data:image/jpeg;base64,${result.image_base64}`}
        alt="Camera Preview"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#111",
        }}
      />
    </div>
  );
}
