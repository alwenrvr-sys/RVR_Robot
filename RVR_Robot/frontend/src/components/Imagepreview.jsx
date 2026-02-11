import { useRef } from "react";
import { useSelector } from "react-redux";
import ImageOverlay from "./ImageOverlay";
import { FileImageOutlined } from "@ant-design/icons";
export default function Imagepreview() {
  const imgRef = useRef(null);
  const { running, image_base64 } = useSelector((state) => state.app);
  const cameraResult = useSelector((state) => state.camera.result);

  const imageBase64 = running ? image_base64 : cameraResult?.image_base64;

  if (!imageBase64)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column", 
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <FileImageOutlined style={{ fontSize: 40 }} />

        <h4
          style={{
            marginTop: 8,
            fontSize: 14,
            fontWeight: 400,
            marginBottom: 0,
          }}
        >
          No Image Uploaded
        </h4>
      </div>
    );

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
