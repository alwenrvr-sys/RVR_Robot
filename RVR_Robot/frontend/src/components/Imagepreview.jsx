import { useRef } from "react";
import { useSelector } from "react-redux";
import ImageOverlay from "./ImageOverlay";

export default function Imagepreview() {
  const imgRef = useRef(null);
  const { running, image_base64 } = useSelector((state) => state.app);
  const cameraResult = useSelector((state) => state.camera.result);

  const imageBase64 = running ? image_base64 : cameraResult?.image_base64;

  if (!imageBase64) return <div>No image</div>;

  return (
    <div className="joystick-preview" style={{ position: "relative" }}>
      <img
        ref={imgRef}
        src={`data:image/jpeg;base64,${imageBase64}`}
        alt="Preview"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <ImageOverlay imgRef={imgRef} />
    </div>
  );
}
