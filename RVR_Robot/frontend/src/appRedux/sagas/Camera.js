import { call, put, takeEvery, select } from "redux-saga/effects";
import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
  ANALYZE_IMAGE,
  ANALYZE_IMAGE_SUCCESS,
  ANALYZE_IMAGE_FAILURE,
  RUN_AUTOSETUP_SUCCESS,
  RUN_AUTOSETUP_FAILURE,
  RUN_AUTOSETUP,
  GET_CAMERA_PING,
  GET_CAMERA_PING_SUCCESS,
  GET_CAMERA_PING_FAILURE,
} from "../../constants/ActionType";
import { showNotification } from "../actions/Notify";
import { CAMERA_SERVICE } from "../../services/CameraServices";

function* getCameraPingAsync() {
  try {
    const response = yield call(CAMERA_SERVICE.PING);

    yield put({
      type: GET_CAMERA_PING_SUCCESS,
      payload: response.data.connected,
    });
    yield put(showNotification("camera", "Camera Connected"));
  } catch (error) {
    yield put({
      type: GET_CAMERA_PING_FAILURE,
      payload: error.message,
    });
  }
}

export function* getCameraPing() {
  yield takeEvery(GET_CAMERA_PING, getCameraPingAsync);
}

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
    yield put(showNotification("camera", "Camera Triggered"));
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
    yield put(showNotification("camera", "Image Analyzed"));
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
function* runAutosetupAsync() {
  try {
    const res = yield call(CAMERA_SERVICE.AUTOSETUP);

    yield put({
      type: RUN_AUTOSETUP_SUCCESS,
      payload: res.data,
    });
    const state = yield select((state) => state.robot);
    const z = state.pose?.z;

    if (z != null) {
      yield put({
        type: CAMERA_TRIGGER,
        payload: { currentZ: z },
      });
    }
  } catch (err) {
    yield put({
      type: RUN_AUTOSETUP_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

export function* runAutosetup() {
  yield takeEvery(RUN_AUTOSETUP, runAutosetupAsync);
}
