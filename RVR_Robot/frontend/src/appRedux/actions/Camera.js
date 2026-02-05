import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
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
