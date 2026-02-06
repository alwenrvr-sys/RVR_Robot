import { useRef } from "react";
import { useSelector } from "react-redux";
import ImageOverlay from "./ImageOverlay";

export default function Imagepreview() {
  const imgRef = useRef(null);
  const { loading, result } = useSelector((state) => state.camera);

  if (!result?.image_base64) return <div>No image</div>;

  return (
    <div className="joystick-preview" style={{ position: "relative" }}>
      <img
        ref={imgRef}
        src={`data:image/jpeg;base64,${result.image_base64}`}
        alt="Camera Preview"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <ImageOverlay imgRef={imgRef} />
    </div>
  );
}
