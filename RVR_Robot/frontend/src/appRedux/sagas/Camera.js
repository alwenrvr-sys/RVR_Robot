import { call, put, takeEvery } from "redux-saga/effects";
import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
  ANALYZE_IMAGE,
  ANALYZE_IMAGE_SUCCESS,
  ANALYZE_IMAGE_FAILURE,
} from "../../constants/ActionType";

import { CAMERA_SERVICE } from "../../services/CameraServices";

function* triggerCameraAsync(action) {
  console.log("Saga triggered", action.payload);

  try {
    const { currentZ } = action.payload;

    const response = yield call(CAMERA_SERVICE.CAMERA_TRIGGER, currentZ);

    console.log("Saga response", response);

    yield put({
      type: CAMERA_TRIGGER_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    console.error("Saga error", error);
    yield put({
      type: CAMERA_TRIGGER_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
}

export function* triggerCamera() {
  yield takeEvery(CAMERA_TRIGGER, triggerCameraAsync);
}


function* analyzeImageAsync(action) {
  try {
    const payload = action.payload;

    // ---- minimal frontend safety ----
    if (!payload?.image_base64) {
      throw new Error("Image is missing");
    }

    const response = yield call(CAMERA_SERVICE.ANALYZE, payload);

    yield put({
      type: ANALYZE_IMAGE_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    yield put({
      type: ANALYZE_IMAGE_FAILURE,
      payload: error.response?.data?.detail || error.message,
    });
  }
}

export function* analyzeImage() {
  yield takeEvery(ANALYZE_IMAGE, analyzeImageAsync);
}