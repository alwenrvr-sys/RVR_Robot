import { call, put, takeEvery, delay } from "redux-saga/effects";
import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
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
