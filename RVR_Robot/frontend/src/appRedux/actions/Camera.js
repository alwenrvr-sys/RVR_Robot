import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
  ANALYZE_IMAGE,
  ANALYZE_IMAGE_SUCCESS,
  ANALYZE_IMAGE_FAILURE,
  CAMERA_LOCAL_IMAGE,
  RUN_AUTOSETUP
} from "../../constants/ActionType";

export const triggerCamera = (currentZ) => ({
  type: CAMERA_TRIGGER,
  payload: { currentZ },
});

export const triggerCameraSuccess = (data) => ({
  type: CAMERA_TRIGGER_SUCCESS,
  payload: data,
});

export const triggerCameraFailure = (error) => ({
  type: CAMERA_TRIGGER_FAILURE,
  payload: error,
});

export const analyzeImage = (payload) => ({
  type: ANALYZE_IMAGE,
  payload,
});

export const analyzeImageSuccess = (data) => ({
  type: ANALYZE_IMAGE_SUCCESS,
  payload: data,
});

export const analyzeImageFailure = (error) => ({
  type: ANALYZE_IMAGE_FAILURE,
  payload: error,
});

export const uploadLocalImage = (base64) => ({
  type: "CAMERA_LOCAL_IMAGE",
  payload: base64,
});

export const runAutosetup = () => ({
  type: RUN_AUTOSETUP,
});